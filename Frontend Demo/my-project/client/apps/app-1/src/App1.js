/**
 * App1 is defined as
 * `<e-app-1>`
 *
 * Imperatively create application
 * @example
 * let app = new App1();
 *
 * Declaratively create application
 * @example
 * <e-app-1></e-app-1>
 *
 * @extends {App}
 */
import { definition } from '@eui/component';
import { App, html } from '@eui/app';
import style from './app1.css';
import '@eui/layout';
import '@eui/table';
//import data from './sampleJson.json'; //not needed when comes thorugh as object
import sampleData from './sampleJSON2.json';
import fetch from 'node-fetch';


@definition('e-app-1', {
  style,
  props: {
    response: { attribute: false },
  },
})
export default class App1 extends App {
  // Uncomment this block to add initialization code
  // constructor() {
  //   super();
  //   // initialize
  // }

//    handleEvent(event) {
//      if (event.target.id === "name" && event.key === 'Enter') {
//        this._printRepoName();
//      }
//    }

//    _addRow()
//    {
//        console.log("adding row....");
//        const contTable = this.shadowRoot.querySelector(".cont-table");
//        const rowToAdd = {col1: "Alicia", col2: "8"};
//        contTable.cdata += [contTable.cdata, rowToAdd];
//        render();
//    }

    _printRepoName(){
    let textField = this.shadowRoot.querySelector('.reponame');
    let sdate = this.shadowRoot.querySelector('.sdate');
    let edate = this.shadowRoot.querySelector('.edate');
    console.log("Name: " + textField.value)
    console.log("Start Date: " + sdate.date)
    console.log("End Date: " + edate.date)
    //textField.value ='';
    //const nameField = this.querySelector('.reponame');
    //let n = document.getElementById('name').value;
    //console.log("Name of repo: " + n)
    console.log("submitted")
//    console.log(document.getElementById('name').innerHTML=this.value)


    let details_name_tf = this.shadowRoot.querySelector('.details_name');
    let details_sdate_tf = this.shadowRoot.querySelector('.details_s');
    let details_edate_tf = this.shadowRoot.querySelector('.details_e');
    details_name_tf.value = textField.value;
    details_sdate_tf.value = sdate.date;
    details_edate_tf.value = edate.date;

    textField.value = '';
    sdate.date = '2022-03-10';
    edate.date = '2022-08-29';

    }


    async _fetchAllSearches(){
    try{
        let response = await fetch('http://localhost:9090/searchSQLite');
        let data = await response.json();
        console.log(data);
        }
     catch(e){
        console.log(e);
        }
    }
    async _fetchAllStats(){
    try{
        let response = await fetch('http://localhost:9090/searchSQLiteStats');
        let data = await response.json();
        console.log(data);
        }
    catch(e){
        console.log(e);
        }
    }


    async _fetchAllContributions(){
    try{
        let response = await fetch('http://localhost:9090/searchSQLiteContributions');
        let data = await response.json();
        console.log(data);
        }
    catch(e){
        console.log(e);
        }
        this._updateContTable();
    }


    async _fetchRepo()
    {

    try
    {
        let loading = this.shadowRoot.querySelector('.loading');
        loading.hidden = false;
        let textField = this.shadowRoot.querySelector('.reponame');
        let sdate = this.shadowRoot.querySelector('.sdate');
        let edate = this.shadowRoot.querySelector('.edate');
        console.log(textField.value);
        console.log(sdate.date);

        let urlFirst = "";
        let urlSecond = "";
        let urlThird = "";
        const myArray = textField.value.split("/");
        urlFirst = myArray[0];
        urlSecond = myArray[1];
        urlThird = myArray[2];
        var myURL = "http://localhost:9090/passParams/" + urlFirst + "/" + urlSecond + "/" + urlThird + "/" + sdate.date + "/" + edate.date;
        this._printRepoName();
        const options = {
        method: "GET",
        mode: "no-cors"};

        console.log(myURL);
        const response = await fetch(myURL, options);
        const data = await response

        console.log(data);
        this._updateTables();
        loading.hidden = true;
    }
     catch(e)
     {
        console.log(e);
     }
}
    async _updateSearchTable(){
    let searchTable = this.shadowRoot.querySelector('.search-table');
    searchTable.data = [];
    try{
        let response = await fetch('http://localhost:9090/searchSQLite');
        let data = await response.json();
        let searches = data.Searches;
        for(let i in searches){
            let rowToAdd = {col1: searches[i].ID, col2: searches[i].Repo, col3: searches[i].Since, col4: searches[i].To};
            searchTable.data = [...searchTable.data, rowToAdd];
            }
            console.log(searchTable);
        }
    catch(e){
        console.log(e);
        }
    }
    async _updateContTable(){
    let contTable = this.shadowRoot.querySelector('.cont-table');
    contTable.data = [];
    try{
        let response = await fetch('http://localhost:9090/searchSQLiteContributions');
        let data = await response.json();
        let contributionsPerContributor = data.ContributionsPerContributor;
        for(let i in contributionsPerContributor){
            console.log(contributionsPerContributor[i]);
            let rowToAdd = {col1: contributionsPerContributor[i].SearchID, col2: contributionsPerContributor[i].Contributor, col3: contributionsPerContributor[i].Contributions};
            contTable.data = [...contTable.data, rowToAdd];
            }
            console.log(contTable);
        }
    catch(e){
        console.log(e);
        }
    }

    async _updateRepoTable(){
    let repoTable = this.shadowRoot.querySelector('.repo-table');
    repoTable.data = [];
    try{
        let response = await fetch('http://localhost:9090/searchSQLiteStats');
        let data = await response.json();
        let stats = data.Stats;
        for(let i in stats){
            console.log(stats[i]);
            let rowToAdd2 = {col1: stats[i].StatID, col2: stats[i].SearchID, col3: stats[i].Commits, col4: stats[i].Added, col5: stats[i].Removed, col6: stats[i].SetMax};
            repoTable.data = [...repoTable.data, rowToAdd2];
            }
            console.log(repoTable);
        }
    catch(e){
        console.log(e);
        }
    }
    _updateTables(){
    this._updateSearchTable();
    this._updateContTable();
    this._updateRepoTable()
    }


  /**
  * Render the <e-app-1> app. This function is called each time a
  * prop changes.
  */
  render() {
    const { EUI } = window;
//    const newTable = document.createElement('eui-table-v0');
//    newTable.columns = [
//    { title: 'Title 1', attribute: 'col1' },
//    { title: 'Title 2', attribute: 'col2' }
//    ];
//    newTable.data = [
//    { col1: 'Details 1', col2: 'Details 1'},
//    { col1: 'Details 2', col2: 'Details 2'},
//    { col1: 'Details 3', col2: 'Details 3'},
//    ];
    //parent.appendChild(newTable);

    const columns = [
    {"title":"Stat ID","attribute":"col1","sortable":true},
    {"title":"Search ID","attribute":"col2","sortable":true},
    {"title":"Total Commits","attribute":"col3","sortable":true},
    {"title":"Total Lines Added","attribute":"col4","sortable":true},
    {"title":"Total Lines Removed","attribute":"col5","sortable":true},
    {"title":"Max Change Set Size","attribute":"col6","sortable":true}]


    let ccols = [
    {"title":"Search ID","attribute":"col1","sortable":true},
    {"title":"Contributor","attribute":"col2","sortable":true},
    {"title":"Contributions","attribute":"col3","sortable":true}]

    let searchCols = [
    {"title":"Search ID","attribute":"col1","sortable":true},
    {"title":"Repo","attribute":"col2","sortable":true},
    {"title":"Since","attribute":"col3","sortable":true},
    {"title":"To","attribute":"col4","sortable":true}
    ]

    return html`
    <h1>Git Repository Mining</h1>
    <h2>ESEP July 2022 Project</h2><br>

    <eui-base-v0-loader class="loading" hidden></eui-base-v0-loader>
    <eui-base-v0-text-field class="reponame" id="name" placeholder="repo url" size="35" prefix="https://">
    </eui-base-v0-text-field>

    <eui-base-v0-datepicker class="sdate" name="start-date" date="2022-03-10">
    </eui-base-v0-datepicker>

    <eui-base-v0-datepicker class="edate" name="end-date" date="2022-08-29">
    </eui-base-v0-datepicker>

    <eui-base-v0-button icon=send @click="${() => this._fetchRepo()}">Fetch Repo</eui-base-v0-button>

    <eui-base-v0-button icon=send @click="${() => this._updateTables()}">Update Tables</eui-base-v0-button>

    <br><br><br>
    <eui-base-v0-text-field class="details_name" id="name" placeholder="repo url" size="35" disabled>
    </eui-base-v0-text-field>
    <eui-base-v0-text-field class="details_s" id="startdate" placeholder="date FROM" size="18" disabled>
    </eui-base-v0-text-field>
    <eui-base-v0-text-field class="details_e" id="enddate" placeholder="date TO" size="18" disabled>
    </eui-base-v0-text-field>


    <br><br><br>
    <div slot="content">
    </div>

    <eui-table-v0 .columns=${searchCols} class="search-table"></eui-table-v0>
    <br><br><br>
    <eui-table-v0 class="cont-table" .columns=${ccols}></eui-table-v0>
    <br><br><br>
    <eui-table-v0 .columns=${columns} class="repo-table"></eui-table-v0>


    `;
  }
}

/**
 * Register the component as e-app-1.
 * Registration can be done at a later time and with a different name
 * Uncomment the below line to register the App if used outside the container
 */
// App1.register();

