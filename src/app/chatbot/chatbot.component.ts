import { API_URL } from '../api.config';
import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css'
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  isOpen = false;
  messages: { sender: string, text: string }[] = [];
  userInput = '';
  isTyping = false;

  @ViewChild('chatWindow') chatWindow!: ElementRef;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.messages.push({ sender: 'ai', text: 'Hello! I am your AI Coach. Ask me how you are doing, or ask specific questions about your sleep, sugar intake, water, score or workouts!' });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if(this.isOpen) {
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  sendMessage() {
    if(!this.userInput.trim()) return;

    const userMessage = this.userInput.trim();
    this.messages.push({ sender: 'user', text: userMessage });
    this.userInput = '';
    this.isTyping = true;
    this.scrollToBottom();

    this.http.post<any>(API_URL + '/analytics/chat', { message: userMessage }).subscribe({
      next: (res) => {
        this.isTyping = false;
        this.messages.push({ sender: 'ai', text: res.reply });
        this.scrollToBottom();
      },
      error: () => {
        this.isTyping = false;
        this.messages.push({ sender: 'ai', text: 'Oops, I lost connection to the neural analysis server!' });
        this.scrollToBottom();
      }
    });
  }

  scrollToBottom() {
    try {
      if(this.chatWindow) {
        this.chatWindow.nativeElement.scrollTop = this.chatWindow.nativeElement.scrollHeight;
      }
    } catch(err) { }
  }
}
