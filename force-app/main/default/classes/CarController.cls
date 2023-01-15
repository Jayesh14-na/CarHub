public with sharing class CarController {
    //wrapper class
    // When you want to store a group of values into a single object it is called as wrapper class
    public class Filters {
        @AuraEnabled
        public String searchKey {get;set;} // carFilter.js, searchKey: using that here
        @AuraEnabled
        public Decimal maxPrice {get;set;} // carFilter.js, maxPrice: using that here
        @AuraEnabled
        public String[] categories {get;set;} // carFilter.js, categories: using here
        @AuraEnabled
        public String[] makeType {get;set;} //carFilter.js, makeType: using here
    }
    @AuraEnabled(Cacheable=true)
    public static List<Car__c> getCars(Filters filters){
        String key, whereClause ='';
        Decimal maxPrice;
        String[] categories, makeType, criteria = new List<String>{};
        if(filters !=null){
            maxPrice = filters.maxPrice;
            categories = filters.categories;
            makeType = filters.makeType;
            // check whether searchKey is empty or not, if not empty perform further logic
            if(!String.isEmpty(filters.searchKey)){ 
                key = '%'+filters.searchKey + '%';
                criteria.add('Name LIKE: key');
            }
            if(filters.maxPrice >= 0){
                criteria.add('MSRP__c <= :maxPrice');
            }
            if(filters.categories != null){
                criteria.add('Category__c IN :categories');
            }
            if(filters.makeType != null){
                criteria.add('Make__c IN :makeType');
            }
            if(criteria.size()>0){ // there may be a chance that there's no criteria given. So checking
                whereClause =  ' WHERE ' + String.join(criteria, ' AND ');
            }
        }
        String query = 'SELECT Id, Name, MSRP__c, Description__c,Category__c, Picture_URL__c FROM Car__c' + whereClause + ' WITH SECURITY_ENFORCED ORDER BY Name';
        return Database.query(query); // for running dynamic querries
    }
}
