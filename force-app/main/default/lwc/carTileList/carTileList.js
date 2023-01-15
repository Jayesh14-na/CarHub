import { LightningElement, wire } from 'lwc';
import getCars from '@salesforce/apex/CarController.getCars'

// Lightning message service and a message channel
import CARS_FILTERED_MESSAGE from '@salesforce/messageChannel/CarsFiltered__c';
import CARS_SELECTED_MESSAGE from '@salesforce/messageChannel/CarSelected__c';
import {publish, subscribe, MessageContext, unsubscribe} from 'lightning/messageService';

export default class CarTileList extends LightningElement {

    cars = []
    errors
    filters = {} // for passing the filters in apex class
    carFilterSubscription

    @wire(getCars, {filters: '$filters'}) // name of the parameter should be same as the given in method
    carsHandler({data, error}){
        if(data){
            console.log(data);
            this.cars = data;
        }
        if(error){
            console.error(error);
            this.errors = error;
        }
    }

    // Load context for LMS
    @wire(MessageContext)
    messageContext

    connectedCallback(){
        this.subscribeHandler()
    }

    subscribeHandler(){
        this.carFilterSubscription= subscribe(this.messageContext, CARS_FILTERED_MESSAGE, (message)=>this.handleFilterChanges(message))
    }

    handleFilterChanges(message){
        console.log(message.filters)
        this.filters = {...message.filters}
    }

    handleCarSelected(event){
        console.log("selected car ID: ", event.detail)
        publish(this.messageContext, CARS_SELECTED_MESSAGE,{
            carId:event.detail
        })
    }

    disconnectedCallback(){
        unsubscribe(this.carFilterSubscription)
        this.carFilterSubscription = null
    }
}