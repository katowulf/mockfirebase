import * as _Firebase from 'firebase';

declare module mockfirebase {
  export class MockFirebase extends _Firebase {
    autoFlush(delay?: number|boolean): void;
    flush(delay?: number): void;
    failNext(method: string, err: Error): void;
    forceCancel(error: Error, event?: string, callback?: (dataSnapshot: FirebaseDataSnapshot, prevChildName?: string) => void, context?: Object): void
    getData(): any;
    getKeys(): string[];
    fakeEvent(event: string, key?: string, data?: any, previousChildName?: string, priority?: number): MockFirebase
    getFlushQueue(): FlushEvent[];

    changeAuthState(userData: FirebaseAuthData): void;
    getEmailUser(email: string): any;
  }

  export interface FlushEvent {
    run();
    cancel();
  }

}

declare module 'mockfirebase' {
  export = mockfirebase;
}
