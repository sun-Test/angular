import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { io, Socket } from "socket.io-client";


@Injectable({
  providedIn: 'root'
})
export class WsServiceService {

  socket: any;
  readonly uri: string = "http://localhost:3000";

  constructor() { 
    this.socket = io(this.uri);
    console.info('WsServiceService constructor done');
    this.socket.on("connect", () => {
      console.log("connected: socket id: " + this.socket.id);
    });
  }

  listen(eventName: string) {
    return new Observable((subscriber: any) => {
      this.socket.on(eventName, (data: any) => {
        subscriber.next(data);
      });
    });
  }
  
  emit(eventName: string, data: any) {
    this.socket.emit(eventName, data);
  }
}
