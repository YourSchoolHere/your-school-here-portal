import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { UserService } from '../../services/user.service';
import { HttpService } from '../../services/http.service';
import { SupabaseService } from '../../services/supabase.service';
import { ModalComponent } from '../../common/modal/modal.component';

@Component({
  selector: 'app-contents',
  templateUrl: './contents.component.html',
  styleUrl: './contents.component.scss'
})
export class ContentsComponent {
  public sections: any[] = [];
  public contents: { [sectionId: string]: { list: any[], lastLoaded: number } } = {};
  public selectedSectionId = "";
  public newSectionTitle = "";
  public releaseToStudentsNow = false;
  public newContentTitle = "";
  public newContentType: "link" | "file" = "link";
  public newContentResourceLink = "";
  public newContentFile: File | null = null;
  public docViewerUrl = "";

  constructor(public user: UserService, private http: HttpService, private supabase: SupabaseService, public domSamitizer: DomSanitizer) {
    this.getSections();
  }

  getSections() {
    this.http.get(`/get-sections?class_id=${this.user.course.class_id}`, {headers: {token: window.localStorage.getItem("token") || ""}}).then((res:any) => {
      this.sections = res.sections;
    }).catch(console.warn);
  }

  loadContents() {
    this.docViewerUrl = "";
    if(this.contents[this.selectedSectionId] && (Date.now() - this.contents[this.selectedSectionId].lastLoaded) < 15000) return;
    this.http.get(`/get-contents?section_id=${this.selectedSectionId}`, {headers: {token: window.localStorage.getItem("token") || ""}}).then((res:any) => {
      this.contents[this.selectedSectionId] = { list: res.contents, lastLoaded: Date.now() };
    }).catch(console.warn);
  }

  createNewSection() {
    if(!/^[A-Za-z0-9_\- ]+$/.test(this.newSectionTitle)) {
      return;
    }
    this.http.post("/create-section", {title: this.newSectionTitle, class_id: this.user.course.class_id, visible_to_students: this.releaseToStudentsNow}, {headers: {token: window.localStorage.getItem("token") || ""}}).then((res:any) => {
      this.newSectionTitle = "";
      this.releaseToStudentsNow = false;
      this.getSections();
    }).catch(console.warn);
  }

  onFileSelected(event: any) {
    let arr = event.target.files[0].name.split('.');
    if(!['pdf', 'doc', 'docx', 'ppt', 'pptx', 'rtf'].includes(arr[arr.length-1])) {
      console.log("Invalid file type. Only PDF, DOC, DOCX, PPT, PPTX, RTF files are allowed.");
      this.newContentFile = null;
      return;
    }
    this.newContentFile = event.target.files[0];
  }

  createNewContent = async(newContent: ModalComponent) => {
    if(!/^[A-Za-z0-9_\? \.\-]+$/.test(this.newContentTitle)) {
      return;
    }
    if(this.newContentType == "file") {
      if(!this.newContentFile) {
        return;
      }
      await this.supabase.client.storage.from("ysh-media").upload(`contents/${this.newContentFile.name}`, this.newContentFile);
      this.newContentResourceLink = this.supabase.client.storage.from("ysh-media").getPublicUrl(`contents/${this.newContentFile.name}`).data.publicUrl;
    }
    else if(!this.newContentResourceLink) return;
    this.http.post("/create-content", {title: this.newContentTitle, content_section_id: this.selectedSectionId, resource_link: this.newContentResourceLink, resource_type: this.newContentType, visible_to_students: this.releaseToStudentsNow}, {headers: {token: window.localStorage.getItem("token") || ""}}).then((res:any) => {
      newContent.hide();
      this.newContentTitle = "";
      this.newContentType = "link";
      this.newContentResourceLink = "";
      this.newContentFile = null;
      this.releaseToStudentsNow = false;
      this.loadContents();
    }).catch(console.warn);
  }

  viewResource(resource: any) {
    if(resource.resource_type == "link") {
      this.docViewerUrl = "";
      window.open(resource.resource_link, "_blank");
    }
    else if(resource.resource_type == "file") {
      this.docViewerUrl = resource.resource_link;
    }
  }
}
