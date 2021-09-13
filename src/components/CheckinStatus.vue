
<template>
  <div id="app" align="center">
  <div class="q-gutter-y-md column" >
    <div class="q-pa-md q-gutter-sm">
      <div class="text-h6" align="center">
        Check-In Status
        <div align="right">
        <q-btn
          color="primary"
          icon-right="archive"
          label="Export to csv"
          no-caps
          @click="exportTable"
        ></q-btn>
        </div>
      </div>
      <section v-if="!onloading">
        
        <q-table :title="date" :rows="rows" :columns="columns" row-key="unixtime" :pagination.sync="pagination" :filter="filter">
        <template v-slot:top-right>
          <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
            <template v-slot:append>
              <q-icon name="search"></q-icon>
            </template>
          </q-input>
        </template>
        <template v-slot:top-left>
            <div class="q-pa-md" style="width: 150px; margin-top: 20px">
            <q-input borderless dense debounce="300" v-model="date" mask="date" :rules="['date']">
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                    <q-date v-model="date">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Close" color="primary" flat @click="datePicked()"></q-btn>
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            </div>
        </template>
      
        </q-table>
      </section>
          
     
      <section v-else>
        <div align="center">Loading...</div>
        <div align="center">
          <q-circular-progress indeterminate size="90px" :thickness="0.2" color="lime" center-color="grey-8" track-color="transparent" class="q-ma-md" align="center">
          </q-circular-progress>
        </div>
      </section>
    </div>
  </div>
  </div>
</template>
<script>

import { db } from "src/boot/firebase"
import {auth} from "src/boot/firebase"
import { exportFile } from 'quasar'
export default {

  data() {
    return {
      pagination: {
        sortBy: 'time',
        descending: false,
        rowsPerPage: 15, // current rows per page being displayed
        
      },
      date: '2019/02/01',
      filter : '',
      columns : [

        {
          name: 'unixtime',
          required: true,
          label: 'SID',
          align: 'left',
          field: row => row.unixtime,
          format: val => `${val}`,
          sortable: true
        },
        { name: 'name', align: 'left', label: 'Name', field: 'name', sortable: true },
        { name: 'time', align: 'left', label: 'Check-In Time', field: 'time', sortable: true },
        { name: 'temperature', label: 'Temperature', field: 'temperature', sortable: true }
      ],

        rows : [ ],
        cnt : 1,
        onloading : true
    }
  },
  updated() {

  },
  beforeCreate() {

    // auth.onAuthStateChanged((user) => {
    //         if (user) {
    //             // this.userVal = true;
    //             console.log('User is logged in', user);
    //             // update data or vuex state         
    //             this.isLoginUser = true    
    //             this.onloading = false
    //             this.dataLoad()    
    //         } else {
    //             console.log('User is not logged in.');
    //             this.isLoginUser = false
    //             this.onloading = false
    //         }
    //     });
     
  },
  created() {
      this.dataLoad()    
  },
  mounted() {
    var now = new Date();
    var mon = now.getMonth() + 1
    var date = now.getDate()
    if (mon   < 10) { mon   = "0" + mon;   }
    if (date   < 10) { date   = "0" + date;   }
    this.date = now.getFullYear() + '/' + mon +'/' + date
    console.log(this.date)
  },

  computed: {
  },
  
  methods: {
     wrapCsvValue (val, formatFn) {
          let formatted = formatFn !== void 0
            ? formatFn(val)
            : val

          formatted = formatted === void 0 || formatted === null
            ? ''
            : String(formatted)

          formatted = formatted.split('"').join('""')
          /**
           * Excel accepts \n and \r in strings, but some other CSV parsers do not
           * Uncomment the next two lines to escape new lines
           */
          // .split('\n').join('\\n')
          // .split('\r').join('\\r')

          return `"${formatted}"`
    },
    exportTable () {
        var columns = this.columns
        var rows = this.rows
        // naive encoding to csv format
        const content = [columns.map(col => this.wrapCsvValue(col.label))].concat(
          rows.map(row => columns.map(col => this.wrapCsvValue(
            typeof col.field === 'function'
              ? col.field(row)
              : row[ col.field === void 0 ? col.name : col.field ],
            col.format
          )).join(','))
        ).join('\r\n')

        const status = exportFile(
          'table-export.csv',
          content,
          'text/csv'
        )

        if (status !== true) {
          $q.notify({
            message: 'Browser denied file download...',
            color: 'negative',
            icon: 'warning'
          })
        }
      },
      datePicked(){
        this.cnt = 1
        this.rows = []
        var yyyyMMdd = String(this.date);
        var sYear = yyyyMMdd.substring(0,4);
        var sMonth = yyyyMMdd.substring(5,7);
        var sDate = yyyyMMdd.substring(8,10);

        var startOfDay = new Date(Number(sYear), Number(sMonth)-1, Number(sDate));
        var timestamp = startOfDay / 1;
        console.log("today timestamp =>",timestamp) // eg. 1627311600000
        var timestampp1d = timestamp + 86400000
        // var t_subStr = timestamp.toString()
        // t_subStr = t_subStr.substring(0,8)

        db.collection("checkin").where("time", ">=", timestamp).where("time", "<", timestampp1d)
          .get()
          .then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                  // doc.data() is never undefined for query doc snapshots
                  console.log(doc.id, " => ", doc.data());
                  var tempRow = {name: '', time:'', temperature:''}
                            tempRow.name = doc.data().name
                            const getTime = (timeStamp, offset) => {
                              let d = new Date((timeStamp + offset));
                              console.log(d)
                              var hour = d.getHours()
                              var min = d.getMinutes()
                              var sec = d.getSeconds()

                              if (hour   == 0) { hour = 12;             }
                              if (hour   < 10) { hour   = "0" + hour;   }
                              if (min < 10) { min = "0" + min; }
                              if (sec < 10) { sec = "0" + sec; }

                              let ret = (d.getMonth()+1)+
                                      "/"+(d.getDate())+
                                      " "+hour+
                                      ":"+min+
                                      ":"+sec
                                return `${ret}`;
                            }
                            tempRow.time = getTime(doc.data().time,0)
                            tempRow.unixtime = this.cnt
                            this.cnt++
                            // this.lastTimeStamp = change.doc.data().time
                            tempRow.temperature = doc.data().temperature
                            this.rows.push(tempRow)
              });
          })
          .catch((error) => {
              console.log("Error getting documents: ", error);
          });
      },
      dataLoad: function () {
                this.cnt = 1
                var now = new Date();
                var startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                var timestamp = startOfDay / 1;

                //  var millis = Date.now() - 600*60*1000; 
                console.log("today timestamp =>",timestamp)
                  db.collection("checkin").where("time", ">=", timestamp) // 오늘 체크인만 확인
                    .onSnapshot((snapshot) => {
                        snapshot.docChanges().forEach((change) => {
                            if (change.type === "added") {
                                console.log("data added>>>",change.doc.data())
                            // cities.push(doc.data().name)
                            var tempRow = {name: '', time:'', temperature:''}
                            tempRow.name = change.doc.data().name
                            const getTime = (timeStamp, offset) => {
                              let d = new Date((timeStamp + offset));
                              console.log(d)
                              var hour = d.getHours()
                              var min = d.getMinutes()
                              var sec = d.getSeconds()

                              if (hour   == 0) { hour = 12;             }
                              if (hour   < 10) { hour   = "0" + hour;   }
                              if (min < 10) { min = "0" + min; }
                              if (sec < 10) { sec = "0" + sec; }

                              let ret = (d.getMonth()+1)+
                                      "/"+(d.getDate())+
                                      " "+hour+
                                      ":"+min+
                                      ":"+sec
                                return `${ret}`;
                            }
                            tempRow.time = getTime(change.doc.data().time,0)
                            tempRow.unixtime = this.cnt
                            this.cnt++
                            // this.lastTimeStamp = change.doc.data().time
                            tempRow.temperature = change.doc.data().temperature
                            this.rows.push(tempRow)
                            }
                            
                        });
                    });
            this.onloading = false
      } // end of dataLoad

  }
};
</script>