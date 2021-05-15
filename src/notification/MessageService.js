import { Subject } from 'rxjs'

const subject = new Subject()

export const MessageService = {
  /**
   * Adds an object {type, message} into the subject.
   * @param {string} type of MessageType
   * @param {any} data
   */
  sendMessage: (type, data) => subject.next({ type: type, data: data }),
  /**
   * @return {Observable<any>} observable stream with all messages
   */
  getMessages: () => subject.asObservable()
}

export const MessageType = {
  DATABASE_INIT: 'database_init',
  CONTENT_RECEIVED: 'content_received'
}
