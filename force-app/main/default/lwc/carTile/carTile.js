import { LightningElement, api } from 'lwc';

export default class CarTile extends LightningElement {
    @api car={};// assign it with an empty object because if there is no data then it will display undefined

    handleClick(){
        // we start passing the id of the record from the carTile
        // it will dispatch an event ('selected') and the carTileList will recieve it
        this.dispatchEvent(new CustomEvent('selected', { // creating our own event
            detail: this.car.Id
        }))
    }
}