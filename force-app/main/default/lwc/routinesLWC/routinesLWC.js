import { LightningElement, api, wire } from 'lwc';
import { getRecord } from "lightning/uiRecordApi";
import { getRelatedListRecords } from 'lightning/uiRelatedListApi';
import PLAN_FIELD from "@salesforce/schema/Track__c.Plan__c";
import DAY_OF_THE_WEEK from "@salesforce/schema/Track__c.Day_of_the_week__c";

const fields = [PLAN_FIELD, DAY_OF_THE_WEEK];
const columns = [ { label: 'Name', fieldName: 'Name', sortable: "true"},
                  { label: 'Day of Execution', fieldName: 'Day_of_execution__c'},
                  { label: 'Repetitions', fieldName: 'Repetitions__c', type: 'number', sortable: "true"},
                  { label: 'Series', fieldName: 'Series__c', type: 'number', sortable: "true" },];

export default class RoutinesLWC extends LightningElement {
    @api recordId;
    plan;
    dayExecution;
    routines;
    routines2Display;
    columns = columns;
    sortDirection;
    sortBy;
    mappedData = [];
    error;

    @wire(getRecord, { recordId: "$recordId", fields })
    wiredplan({data, error}){
        if (data) {
            this.plan = data.fields.Plan__c.value;
            this.dayExecution = data.fields.Day_of_the_week__c.value;
        }
        if (error) {
            console.error('Error occurred retrieving Case records...');
        }
    }

    @wire(getRelatedListRecords, {
        parentRecordId: '$plan',
        dayExecution: "$dayExecution",
        relatedListId: 'Routines__r',
        fields: ['Routine__c.Id', 'Routine__c.Name', 'Routine__c.Plan__c', 'Routine__c.Day_of_execution__c', 'Routine__c.Repetitions__c', 'Routine__c.Series__c'],
    })
    listInfo({ error, data }) {
        if (data) {
          this.routines = data.records;
          this.routines2Display = this.routines.filter(elem => elem.fields.Day_of_execution__c.value === this.dayExecution);
          this.mappedData = this.routines2Display.map(item => {
            return {
                Name: item.fields.Name.value,
                Day_of_execution__c: item.fields.Day_of_execution__c.value,
                Repetitions__c: item.fields.Repetitions__c.value,
                Series__c: item.fields.Series__c.value
            };
        });
          this.error = undefined;
        } else if (error) {
          this.error = error;
          this.routines = undefined;
          this.routines2Display = undefined;
          this.mappedData = undefined;
        }
      }

      doSorting(event) {
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.sortData(this.sortBy, this.sortDirection);
    }

    sortData(fieldname, direction) {
      let parseData = JSON.parse(JSON.stringify(this.mappedData));
      // Return the value stored in the field
      let keyValue = (a) => {
          return a[fieldname];
      };
      // cheking reverse direction
      let isReverse = direction === 'asc' ? 1: -1;
      // sorting data
      parseData.sort((x, y) => {
          x = keyValue(x) ? keyValue(x) : ''; // handling null values
          y = keyValue(y) ? keyValue(y) : '';
          // sorting values based on direction
          return isReverse * ((x > y) - (y > x));
      });
      this.mappedData = parseData;
  }    

}