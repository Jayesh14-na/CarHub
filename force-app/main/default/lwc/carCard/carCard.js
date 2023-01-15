import { LightningElement, wire } from 'lwc';

// Car__c Schema
import CAR_OBJ from '@salesforce/schema/Car__c'
import NAME_FIELD from '@salesforce/schema/Car__c.Name';
import PICTURE_URL_FIELD from '@salesforce/schema/Car__c.Picture_URL__c';
import CATEGORY_FIELD from '@salesforce/schema/Car__c.Category__c';
import MAKE_FIELD from '@salesforce/schema/Car__c.Make__c';
import MSRP_FIELD from '@salesforce/schema/Car__c.MSRP__c';
import FUEL_FIELD from '@salesforce/schema/Car__c.Fuel_Type__c';
import SEATS_FIELD from '@salesforce/schema/Car__c.Number_of_Seats__c';
import CONTROL_FIELD from '@salesforce/schema/Car__c.Control__c';

// for extracting field values
import { getFieldValue } from 'lightning/uiRecordApi';

// Lightning message service and a message channel
import CARS_SELECTED_MESSAGE from '@salesforce/messageChannel/CarSelected__c';
import { subscribe, MessageContext, unsubscribe } from 'lightning/messageService';

// navigation
import {NavigationMixin} from 'lightning/navigation'


export default class CarCard extends NavigationMixin(LightningElement) {

    // load context for lms
    @wire(MessageContext)
    messageContext

    // exposing the fields to make it available in the template
    categoryField = CATEGORY_FIELD
    makeField = MAKE_FIELD
    msrpField = MSRP_FIELD
    fuelField = FUEL_FIELD
    seatsField = SEATS_FIELD
    controlField = CONTROL_FIELD

    recordId 

    // car fields displayed with specific format
    carName
    carPictureURL


    // subscription reference for carSelected
    carSelectionSubscription  
    
    handleRecordLoeaded(event){
        const {records} = event.detail;
        const recordData = records[this.recordId] // fetching all the record data
        this.carName = getFieldValue(recordData, NAME_FIELD)
        this.carPictureURL = getFieldValue(recordData, PICTURE_URL_FIELD)
    }y

    connectedCallback(){
        this.subscribeHandler()
    }

    subscribeHandler(){
        this.carSelectionSubscription = subscribe(this.messageContext, CARS_SELECTED_MESSAGE, (message)=>this.handleCarSelected(message))
    }

    handleCarSelected(message){
        this.recordId = message.carId
        // console.log(carId)
    }

    disconnectedCallback(){
        unsubscribe(this.carSelectionSubscription)
        this.carSelectionSubscription = null;
    }

    // Navigation to recordPage
    handleNavigateToRecord(){
        this[NavigationMixin.Navigate]({
            type:'standard__recordPage',
            attributes:{
                recordId:this.recordId,
                objectApiName: CAR_OBJ.objectApiName,
                actionName:'view'
            }
        })
    }
}