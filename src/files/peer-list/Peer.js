export default class Peer {
  constructor (name: string, address: string, inEditMode: boolean = false) {
    this.name = name
    this.address = address
    this.inEditMode = inEditMode
  }
}
