import { Component, Input, ElementRef, Renderer2, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-doc-viewer',
  templateUrl: './doc-viewer.component.html',
  styleUrl: './doc-viewer.component.scss'
})
export class DocViewerComponent implements OnChanges {
  @Input() resourceUrl!: string;
  @ViewChild('docViewer', { static: false }) iframe!: ElementRef;

  private file: File | null = null;
  private dbName = 'ngxDvFileDB';
  private storeName = 'files';
  private db!: IDBDatabase;

  constructor(private sanitizer: DomSanitizer, private renderer: Renderer2, private elem: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.file = null;
    if(!this.resourceUrl.endsWith(".pdf"))
      setTimeout(() => {
        this.iframe.nativeElement.src = `https://docs.google.com/viewer?url=${this.resourceUrl}&embedded=true`;
      }, 200);
    else
      this.openDatabase().then(() => {
        this.storeFile();
      });
  }

  private openDatabase() {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const fileStore = db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
          fileStore.createIndex('url', 'url', { unique: true });
        }
      };

      request.onsuccess = (event) => {
        this.db = ((event.target as IDBRequest).result as IDBDatabase);
        resolve((event.target as IDBRequest).result);
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  storeFile() {
    let request = this.db.transaction("files","readonly").objectStore("files").index('url').get(this.resourceUrl);
    request.onsuccess = () => {
      if (request.result) {
        console.log('File retrieved successfully!', request.result.file);
        this.file = request.result.file;
        this.iframe.nativeElement.src = URL.createObjectURL(this.file!);
      }
      else {
        fetch(this.resourceUrl)
        .then((response) => response.blob())
        .then((blob) => {
          const transaction = this.db.transaction(this.storeName, 'readwrite');
          const store = transaction.objectStore(this.storeName);
          const fileData = { file: blob, url: this.resourceUrl };
          store.add(fileData);
          transaction.oncomplete = () => {
            console.log('File stored successfully!');
            this.retrieveFile();
          };
          transaction.onerror = (event) => {
            console.error('Error storing file:', (event.target as IDBRequest).error);
          };
        })
        .catch((error) => {
          console.error('Error fetching file:', error);
        });
      }
    };
  }

  retrieveFile() {
    const transaction = this.db.transaction(this.storeName, 'readonly');
    const store = transaction.objectStore(this.storeName);
    const index = store.index('url');
    const request = index.get(this.resourceUrl);

    request.onsuccess = (event) => {
      const result = (event.target as IDBRequest).result;
      if (result) {
        console.log('File retrieved successfully!', result.file);
        this.file = result.file;
        this.iframe.nativeElement.src = URL.createObjectURL(this.file!);
      } else {
        console.log('File not found in the database.');
      }
    };

    request.onerror = (event) => {
      console.error('Error retrieving file:', (event.target as IDBRequest).error);
    };
  }

}
