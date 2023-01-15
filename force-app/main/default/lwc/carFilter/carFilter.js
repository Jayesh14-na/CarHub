import { LightningElement, wire } from 'lwc';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';

// Car schema
import CAR_OBJECT from '@salesforce/schema/Car__c';
import CATEGORY_FIELD from '@salesforce/schema/Car__c.Category__c';
import MAKE_FIELD from '@salesforce/schema/Car__c.Make__c';

// Constants
const CATEGORY_ERROR='Error loadoing categories'
const MAKE_ERROR='Error loadoing make types'

// Lightning message service and a message channel
import CARS_FILTERED_MESSAGE from '@salesforce/messageChannel/CarsFiltered__c';
import {publish, MessageContext} from 'lightning/messageService';

export default class CarFilter extends LightningElement {

    filter={
        searchKey: '',
        maxPrice: 999999
    }

    timer // for time interval

    categoryError=CATEGORY_ERROR // local property to show category error msg
    makeError=MAKE_ERROR // local property to show maketype error msg


    // Load context for LMS
    @wire(MessageContext)
    messageContext


    // fetching category picklist
    // for fetching picklist values first we need to get the object info and with this info we can
    // get the recordTypeId
    @wire(getObjectInfo, {objectApiName: CAR_OBJECT})
    carObjectInfo

    // Category picklist
    @wire(getPicklistValues, {
        // $ get the latest data automatically
        recordTypeId: '$carObjectInfo.data.defaultRecordTypeId',
        fieldApiName: CATEGORY_FIELD
    })categories

    // Make picklist
    @wire(getPicklistValues, {
        // $ get the latest data automatically
        recordTypeId: '$carObjectInfo.data.defaultRecordTypeId',
        fieldApiName: MAKE_FIELD
    })makeType


    // searchKey Handler
    handleSearchKeyChange(event){
        console.log(event.target.value)
        // for updating the searchKey values use spread operator
        // if you have field in form of objects use spread operator to update(better approach)
        this.filter = {...this.filter, "searchKey":event.target.value}
        this.sendDataToCarList() //as soon as you type something, this method gets called up for msg publish
    }

    // price range handler
    handleMaxPriceChanges(event){
        console.log(event.target.value)
        this.filter = {...this.filter, "maxPrice":event.target.value}
        this.sendDataToCarList() //as soon as you change something, this method gets called up for msg publish
    }

    handleCheckBox(event){
        /*So suppose I change something in the checkboxes of categories, it immediately calls
        this method handleCheckBox. It will come here, it will see whether the filter is having
        the categories property or not. It is no(only searchKey and maxPrice), it's not there.
        And it will go inside.
        It will take all the categories values and just return a new array assigning into
        categories variable. Similarly, it will go for all the makeType values only and 
        assigning to makeType.
        Then in our property filter it is going to add these 2 filters
        So now the filter property is having 4 values
        */

        if(!this.filter.categories){
            const categories = this.categories.data.values.map(item=>item.value)
            const makeType = this.makeType.data.values.map(item=>item.value)
            // we need to make sure that the name should be same as in html(data-name)

            // this.filter = {...this.filter, categories:categories, makeType:makeType}
            // above code can be written as same below in shortHand notation
            this.filter = {...this.filter, categories, makeType}
        }
        // used dataset to get the name and value easily
        const {name, value} = event.target.dataset
        // console.log("name: ", name)
        // console.log("value: ", value)
        if(event.target.checked){ // checked is a boolean property to know whether it is checked or not

            /*If the user has checked the checkbox, the [name] will come us say categories and it will
            go the filter property and go to categories key and search whatever the value you have
            selected, whether you have checked or unchecked, is already there or not
            If it's not there, which means he has checked something that was not only available in the
            categories array, so we are going to add that value inside that categories.
            */

            if(!this.filter[name].includes(value)){ // [name] is for the carFilter html data-name
            // if(!this.filter["categories"].includes(value))
                this.filter[name] = [...this.filter[name], value]
            }
        } else{
            this.filter[name] = this.filter[name].filter(item=>item!==value)
            // filtering out all the values and checking if the value is there, just remove that and
            // return all the new values. Fiilter method always returns a new array and it is assigned
            // to filter
        }
        this.sendDataToCarList()
    }


    // method for passing the messages
    sendDataToCarList(){
        window.clearTimeout(this.timer) // debouncing technique, clear the previous timer
        this.timer = window.setTimeout(()=>{
            publish(this.messageContext, CARS_FILTERED_MESSAGE, {
                filters:this.filter
                // filters:this.filter
                // messageChannels field name: object name in this file
            })
        },400) // 400ms
        
    }
}