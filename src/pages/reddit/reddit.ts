import { Component, ViewChild } from '@angular/core';
import { Content, Events, IonicPage, MenuController } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';

import { RedditService } from '../../app/services/reddit.service';
import { ObjectService } from '../../app/services/object.service';

@IonicPage()
@Component({
  selector: 'reddit',
  templateUrl: 'reddit.html'
})
export class RedditPage {

  @ViewChild(Content) content: Content;
  items: any;
  limit: number;
  redditCategory: string;

  constructor(private events: Events, private menuCtrl: MenuController, public redditService: RedditService, public objectService: ObjectService, public iab: InAppBrowser) {
    this.getDefaults();

    events.subscribe('redditMenu:clicked', (category) => {
      this.redditCategory = category;
      this.content.scrollToTop(0);
      this.getReddits();
    });
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true, 'redditMenu');
    console.log(this.items);
  }

  getDefaults() {
    this.limit = 10;
    this.redditCategory = localStorage.getItem('redditCategory');
    this.getReddits();
  }

  getReddits() {
    this.redditService.getPosts(this.redditCategory, this.limit, '').subscribe(response => {
      this.items = response.data.children;

      for (let i = 0; i < this.items.length; i++)
        if (this.items[i].data.selftext != '')
          this.items[i].expanded = false;
    });
  }
  expandItem(item): any {
    if (item.data.selftext != '') {
      this.items.map((listItem) => {
        if (item == listItem)
          listItem.expanded = !listItem.expanded;
        else
          listItem.expanded = false;
        return listItem;
      });
    }
  }

  refreshReddits(refresher: any) {
    this.getReddits();
    setTimeout(() => {
      refresher.complete();
    }, 1000);
  }

  moreReddits(infiniteScroll: any) {
    this.redditService.getPosts(this.redditCategory, this.limit, this.items[this.items.length - 1].data.name).subscribe(response => {
      for (let i = 0; i < response.data.children.length; i++) {
        this.items.push(response.data.children[i]);
        if (this.items[this.items.length - response.data.children.length + i].data.selftext != '')
          this.items[this.items.length - response.data.children.length + i].expanded = false;
      }
    });
    setTimeout(() => {
      infiniteScroll.complete();
    }, 1000);
  }
}