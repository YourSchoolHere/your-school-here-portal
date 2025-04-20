import { Component, PLATFORM_ID, Inject, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { isPlatformBrowser } from "@angular/common";

import { UserService } from '../../services/user.service';
import { HttpService } from '../../services/http.service';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-announcements',
  templateUrl: './announcements.component.html',
  styleUrl: './announcements.component.scss'
})
export class AnnouncementsComponent implements OnInit {
  public announcements: any[] = [];
  public html = "";
  public froala!:any;
  public froalaConfig = {
    toolbarButtons: [
      'bold', 'italic', 'underline', 'strikeThrough', 'fontSize', 'fontFamily', 'textColor', 'backgroundColor', 'align', 'formatOL', 'formatUL',
      'undo', 'redo', 'insertLink', 'insertImage', 'insertVideo', 'emoticons'
    ],
    pluginsEnabled: ['emoticons', 'image', 'video', 'link', 'lists', 'fontFamily', 'fontSize', 'align', 'colors'],
    emoticons: {
      emots: [
        { code: ':)', char: '😊' },
        { code: ':(', char: '😞' },
        { code: ';)', char: '😉' },
        // Add more emoticons as needed
      ]
    },
    scrollableContainer: "#announcements-editor"
  };

  constructor(@Inject(PLATFORM_ID) private platformId: Object, public user: UserService, public http: HttpService, public domSanitizer: DomSanitizer, private supabase: SupabaseService) {
    this.viewAnnouncements();
  }

  ngOnInit(): void {
      if (isPlatformBrowser(this.platformId)) {
        // @ts-ignore
        import('froala-editor/js/plugins.pkgd.min.js');
      }
  }

  viewAnnouncements() {
    this.http.get(`/get-announcements?class_id=${this.user.course.class_id}`, {headers: {token: window.localStorage.getItem("token") || ""}}).then((res:any) => {
      this.announcements = res.announcements.map((obj:any) => ({...obj, html: this.domSanitizer.bypassSecurityTrustHtml(obj.html)}));
    }).catch(console.warn);
  }

  createAnnouncement = async() => {
    try {
      const blobLinks = this.html.match(/src="blob:.*"/g)?.map(str => str.split('"')[1]);
      if(blobLinks) {
        const responses = await Promise.all(blobLinks.map(link => fetch(link)));
        const blobs = await Promise.all(responses.map(response => response.blob()));
        const files = blobs.map(blob => new File([blob], "file"+Date.now(), { type: blob.type }));
        await Promise.all(files.map(file => this.supabase.client.storage.from("ysh-media").upload(`announcement/${file.name}`,file)));
        const publicFileURLs = files.map(file => this.supabase.client.storage.from("ysh-media").getPublicUrl(`announcement/${file.name}`).data.publicUrl);
        let i = 0;
        this.html = this.html.replace(/src="blob:[^"]+"/g, (match) => {
          if (i < publicFileURLs.length) {
            return `src="${publicFileURLs[i++]}"`;
          }
          return match;
        });
        console.log(this.html);
      }
      this.http.post(`/create-announcement`, {class_id: this.user.course.class_id, html: this.html}, {headers: {token: window.localStorage.getItem("token") || ""}}).then((res:any) => {
        this.html = "";
        this.viewAnnouncements();
      }).catch(console.warn);
    }
    catch (err) {
      console.warn(err);
    }
  }
}
