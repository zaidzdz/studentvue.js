(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "../../utils/soap/soap", "../Message/Message", "date-fns", "../../Constants/EventType", "lodash", "../ReportCard/ReportCard", "../Document/Document", "../RequestException/RequestException", "../../utils/XMLFactory/XMLFactory", "../../utils/cache/cache", "./Client.helpers", "he"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("../../utils/soap/soap"), require("../Message/Message"), require("date-fns"), require("../../Constants/EventType"), require("lodash"), require("../ReportCard/ReportCard"), require("../Document/Document"), require("../RequestException/RequestException"), require("../../utils/XMLFactory/XMLFactory"), require("../../utils/cache/cache"), require("./Client.helpers"), require("he"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.soap, global.Message, global.dateFns, global.EventType, global.lodash, global.ReportCard, global.Document, global.RequestException, global.XMLFactory, global.cache, global.Client, global.he);
    global.Client = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports, _soap, _Message, _dateFns, _EventType, _lodash, _ReportCard, _Document, _RequestException, _XMLFactory, _cache, _Client, _he) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _soap = _interopRequireDefault(_soap);
  _Message = _interopRequireDefault(_Message);
  _EventType = _interopRequireDefault(_EventType);
  _lodash = _interopRequireDefault(_lodash);
  _ReportCard = _interopRequireDefault(_ReportCard);
  _Document = _interopRequireDefault(_Document);
  _RequestException = _interopRequireDefault(_RequestException);
  _XMLFactory = _interopRequireDefault(_XMLFactory);
  _cache = _interopRequireDefault(_cache);
  _he = _interopRequireDefault(_he);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /**
   * TO DO; rewrite the studentInfo stuff to primary ChildList with studentInfo as the fallback, 
   * make the type REQUIRE the info about school concurrency, thusly, the login function will determine it in the immediate by concurrenrtly performing the fetches
   * to thusly have a minimal speed impact
   * 
   * 
   * 
   * 
   * 
   * 
   * 
   * 
   * 
   * 
   * 
   * 
   * 
   * 
   * 
   * 
   * 
   * 
   * 
   * The StudentVUE Client to access the API
   * @constructor
   * @extends {soap.Client}
   */
  class Client extends _soap.default.Client {
    constructor(credentials, proxyUrl, hostUrl) {
      super(credentials, proxyUrl);
      this.hostUrl = hostUrl;
    }

    /**
     * Validate's the user's credentials. It will throw an error if credentials are incorrect
     */
    validateCredentials() {
      return new Promise((res, rej) => {
        super.processRequest({
          validateErrors: false,
          methodName: 'fuck'
        }).then(response => {
          if (response.RT_ERROR[0]['@_ERROR_MESSAGE'][0].includes("A critical error has occurred")) {
            res();
          } else {
            rej(new _RequestException.default(response));
          }
          ;
        }).catch(rej);
      });
    }

    /**
     * Gets the student's documents from synergy servers
     * @returns {Promise<Document[]>}> Returns a list of student documents
     * @description
     * ```js
     * const documents = await client.documents();
     * const document = documents[0];
     * const files = await document.get();
     * const base64collection = files.map((file) => file.base64);
     * ```
     */
    documents() {
      return new Promise((res, rej) => {
        super.processRequest({
          methodName: 'GetStudentDocumentInitialData',
          paramStr: {
            childIntId: 0
          }
        }).then(xmlObject => {
          if (typeof xmlObject['StudentDocuments'][0].StudentDocumentDatas[0] == "string") {
            console.log("where is my mind");
            return res([[],
            // @ts-ignore
            xmlObject.extraData]);
          } else {
            var _a = xmlObject['StudentDocuments'][0].StudentDocumentDatas[0].StudentDocumentData;
            var _f = xml => {
              return new _Document.default(xml, super.credentials);
            };
            var _r = [];
            for (var _i = 0; _i < _a.length; _i++) {
              _r.push(_f(_a[_i], _i, _a));
            }
            res([_r,
            //@ts-ignore
            xmlObject.extraData]);
          }
        }).catch(rej);
      });
    }

    /**
     * Gets a list of report cards
     * @returns {Promise<ReportCard[]>} Returns a list of report cards that can fetch a file
     * @description
     * ```js
     * const reportCards = await client.reportCards();
     * const files = await Promise.all(reportCards.map((card) => card.get()));
     * const base64arr = files.map((file) => file.base64); // ["JVBERi0...", "dUIoa1...", ...];
     * ```
     */
    reportCards() {
      return new Promise((res, rej) => {
        super.processRequest({
          methodName: 'GetReportCardInitialData',
          paramStr: {
            childIntId: 0
          }
        }).then(xmlObject => {
          var _a2 = xmlObject.RCReportingPeriodData[0].RCReportingPeriods[0].RCReportingPeriod;
          var _f2 = xml => {
            return new _ReportCard.default(xml, super.credentials);
          }
          //@ts-ignore
          ;
          var _r2 = [];
          for (var _i2 = 0; _i2 < _a2.length; _i2++) {
            _r2.push(_f2(_a2[_i2], _i2, _a2));
          }
          res([_r2, xmlObject.extraData]);
        }).catch(rej);
      });
    }

    /**
     * Gets the student's school's information
     * @returns {Promise<SchoolInfo>} Returns the information of the student's school
     * @description
     * ```js
     * await client.schoolInfo();
     *
     * client.schoolInfo().then((schoolInfo) => {
     *  console.log(_.uniq(schoolInfo.staff.map((staff) => staff.name))); // List all staff positions using lodash
     * })
     * ```
     */
    schoolInfo() {
      return new Promise((res, rej) => {
        super.processRequest({
          methodName: 'StudentSchoolInfo',
          paramStr: {
            childIntID: 0
          }
        }).then(result => {
          const xmlObject = result.StudentSchoolInfoListing[0];
          //@ts-ignore
          xmlObject.extraData = result.extraData;
          var _a3 = xmlObject.StaffLists[0].StaffList;
          var _f3 = staff => {
            return {
              name: staff['@_Name'][0],
              email: staff['@_EMail'][0],
              staffGu: staff['@_StaffGU'][0],
              jobTitle: staff['@_Title'][0],
              extn: staff['@_Extn'][0],
              phone: staff['@_Phone'][0]
            };
          };
          var _r3 = [];
          for (var _i3 = 0; _i3 < _a3.length; _i3++) {
            _r3.push(_f3(_a3[_i3], _i3, _a3));
          }
          res([{
            school: {
              address: xmlObject['@_SchoolAddress'][0],
              addressAlt: xmlObject['@_SchoolAddress2'][0],
              city: xmlObject['@_SchoolCity'][0],
              zipCode: xmlObject['@_SchoolZip'][0],
              phone: xmlObject['@_Phone'][0],
              altPhone: xmlObject['@_Phone2'][0],
              principal: {
                name: xmlObject['@_Principal'][0],
                email: xmlObject['@_PrincipalEmail'][0],
                staffGu: xmlObject['@_PrincipalGu'][0]
              }
            },
            staff: _r3
            //@ts-ignore
          }, xmlObject.extraData]);
        }).catch(rej);
      });
    }

    /**
     * Gets the schedule of the student
     * @param {number} termIndex The index of the term.
     * @returns {Promise<Schedule>} Returns the schedule of the student
     * @description
     * ```js
     * await schedule(0) // -> { term: { index: 0, name: '1st Qtr Progress' }, ... }
     * ```
     */
    schedule(termIndex) {
      return new Promise((res, rej) => {
        super.processRequest({
          methodName: 'StudentClassList',
          paramStr: {
            childIntId: 0,
            ...(termIndex != null ? {
              TermIndex: termIndex
            } : {})
          }
        }).then(xmlObject => {
          var response = {};
          response.termName = xmlObject.StudentClassSchedule[0]['@_TermIndexName'][0]; //could sometimes be strings but fuck that
          response.termIndex = xmlObject.StudentClassSchedule[0]['@_TermIndex'][0];
          //for now we're not grabbing the terms for the conccurent school, they lowk don't matter
          var _a4 = xmlObject.StudentClassSchedule[0].TermLists[0].TermListing;
          var _f4 = term => {
            return {
              start: term['@_BeginDate'][0],
              end: term['@_EndDate'][0],
              termIndex: term['@_TermIndex'][0],
              termName: term['@_TermName'][0]
            };
          };
          var _r4 = [];
          for (var _i4 = 0; _i4 < _a4.length; _i4++) {
            _r4.push(_f4(_a4[_i4], _i4, _a4));
          }
          response.terms = _r4;
          var _a5 = xmlObject.StudentClassSchedule[0].ClassLists[0].ClassListing;
          var _f5 = course => {
            return {
              name: course['@_CourseTitle'][0],
              period: course['@_Period'][0],
              teacher: course['@_Teacher'][0],
              room: course['@_RoomName'][0]
            };
          };
          var _r5 = [];
          for (var _i5 = 0; _i5 < _a5.length; _i5++) {
            _r5.push(_f5(_a5[_i5], _i5, _a5));
          }
          response.mainClasses = _r5;
          var checker = false;
          try {
            checker = xmlObject.StudentClassSchedule[0].ConcurrentSchoolStudentClassSchedules[0].ConcurrentSchoolStudentClassSchedule[0].ConSchClassLists[0].ClassListing[0] != '';
          } catch {}
          if (checker) {
            var _a6 = xmlObject.StudentClassSchedule[0].ConcurrentSchoolStudentClassSchedules[0].ConcurrentSchoolStudentClassSchedule[0].ConSchClassLists[0].ClassListing;
            var _f6 = course => {
              return {
                name: course['@_CourseTitle'][0],
                period: course['@_Period'][0],
                teacher: course['@_Teacher'][0],
                room: course['@_RoomName'][0]
              };
            };
            var _r6 = [];
            for (var _i6 = 0; _i6 < _a6.length; _i6++) {
              _r6.push(_f6(_a6[_i6], _i6, _a6));
            }
            response.conClasses = _r6;
            response.conClasses.conName = xmlObject.StudentClassSchedule[0].ConcurrentSchoolStudentClassSchedules[0].ConcurrentSchoolStudentClassSchedule[0]['@_SchoolName'];
          }
          try {
            if (xmlObject.StudentClassSchedule[0].TodayScheduleInfoData[0].SchoolInfos[0] != '') {
              response.today = {};
              var _a7 = xmlObject.StudentClassSchedule[0].TodayScheduleInfoData[0].SchoolInfos[0].SchoolInfo[0].Classes[0].ClassInfo;
              var _f7 = course => {
                return {
                  name: course['@_ClassName'],
                  start: course['@_StartTime'],
                  end: course['@_EndTime'],
                  teacher: course['@_TeacherName'],
                  period: course['@_Period'],
                  room: course['@_RoomName']
                };
              };
              var _r7 = [];
              for (var _i7 = 0; _i7 < _a7.length; _i7++) {
                _r7.push(_f7(_a7[_i7], _i7, _a7));
              }
              response.today.main = _r7;
              try {
                var _a8 = xmlObject.StudentClassSchedule[0].TodayScheduleInfoData[0].SchoolInfos[0].SchoolInfo[1].Classes[0].ClassInfo;
                var _f8 = course => {
                  return {
                    name: course['@_ClassName'],
                    start: course['@_StartTime'],
                    end: course['@_EndTime'],
                    teacher: course['@_TeacherName'],
                    period: course['@_Period'],
                    room: course['@_RoomName']
                  };
                };
                var _r8 = [];
                for (var _i8 = 0; _i8 < _a8.length; _i8++) {
                  _r8.push(_f8(_a8[_i8], _i8, _a8));
                }
                response.today.con = _r8;
                response.today.conName = xmlObject.StudentClassSchedule[0].TodayScheduleInfoData[0].SchoolInfos[0].Schoolinfo[1]['@_SchoolName'];
              } catch {
                console.log("no concurrent");
              }
            } else {
              response.today = false;
            }
          } catch (error) {
            console.log(error);
            response.today = false;
          }
          res([response, xmlObject.extraData]);
        }

        //@ts-ignore
        ).catch(rej);
      });
    }

    /**
     * Returns the attendance of the student
     * @returns {Promise<Attendance>} Returns an Attendance object
     * @description
     * ```js
     * client.attendance()
     *  .then(console.log); // -> { type: 'Period', period: {...}, schoolName: 'University High School', absences: [...], periodInfos: [...] }
     * ```
     */
    attendance() {
      return new Promise((res, rej) => {
        super.processRequest({
          methodName: 'Attendance',
          paramStr: {
            childIntId: 0
          }
        }).then(attendanceXMLObject => {
          const xmlObject = attendanceXMLObject.Attendance[0];
          //@ts-ignore
          xmlObject.extraData = attendanceXMLObject.extraData;
          var _a9 = xmlObject.TotalActivities[0].PeriodTotal;
          var _f9 = (pd, i) => {
            return {
              period: Number(pd['@_Number'][0]),
              total: {
                excused: Number(xmlObject.TotalExcused[0].PeriodTotal[i]['@_Total'][0]),
                tardies: Number(xmlObject.TotalTardies[0].PeriodTotal[i]['@_Total'][0]),
                unexcused: Number(xmlObject.TotalUnexcused[0].PeriodTotal[i]['@_Total'][0]),
                activities: Number(xmlObject.TotalActivities[0].PeriodTotal[i]['@_Total'][0]),
                unexcusedTardies: Number(xmlObject.TotalUnexcusedTardies[0].PeriodTotal[i]['@_Total'][0])
              }
            };
          };
          var _r9 = [];
          for (var _i9 = 0; _i9 < _a9.length; _i9++) {
            _r9.push(_f9(_a9[_i9], _i9, _a9));
          }
          res([{
            type: xmlObject['@_Type'][0],
            period: {
              total: Number(xmlObject['@_PeriodCount'][0]),
              start: Number(xmlObject['@_StartPeriod'][0]),
              end: Number(xmlObject['@_EndPeriod'][0])
            },
            schoolName: xmlObject['@_SchoolName'][0],
            absences: xmlObject.Absences[0].Absence ? xmlObject.Absences[0].Absence.map(absence => {
              return {
                date: new Date(absence['@_AbsenceDate'][0]),
                reason: absence['@_Reason'][0],
                note: absence['@_Note'][0],
                description: absence['@_CodeAllDayDescription'][0],
                periods: absence.Periods[0].Period.map(period => {
                  return {
                    period: Number(period['@_Number'][0]),
                    name: period['@_Name'][0],
                    reason: period['@_Reason'][0],
                    course: period['@_Course'][0],
                    staff: {
                      name: period['@_Staff'][0],
                      staffGu: period['@_StaffGU'][0],
                      email: period['@_StaffEMail'][0]
                    },
                    orgYearGu: period['@_OrgYearGU'][0]
                  };
                })
              };
            }) : [],
            periodInfos: _r9
          },
          //@ts-ignore
          xmlObject.extraData]);
        }).catch(rej);
      });
    }

    /**
     * Returns the gradebook of the student
     * @param {number} reportingPeriodIndex The timeframe that the gradebook should return
     * @returns {Promise<Gradebook>} Returns a Gradebook object
     * @description
     * ```js
     * const gradebook = await client.gradebook();
     * console.log(gradebook); // { error: '', type: 'Traditional', reportingPeriod: {...}, courses: [...] };
     *
     * await client.gradebook(0) // Some schools will have ReportingPeriodIndex 0 as "1st Quarter Progress"
     * await client.gradebook(7) // Some schools will have ReportingPeriodIndex 7 as "4th Quarter"
     * ```
     */

    gradebook = Object.assign((reportingPeriodIndex, orgYearGu) => {
      super.processRequest({
        methodName: 'Gradebook',
        paramStr: {
          childIntId: 0,
          ...(reportingPeriodIndex != null ? {
            ReportPeriod: reportingPeriodIndex
          } : {}),
          ...(orgYearGu != null ? {
            ConcurrentSchOrgYearGU: orgYearGu
          } : {})
        }
      }).then(rawXml => {
        return rawXml;
      });
    }, {
      preparse(xml) {
        return new _XMLFactory.default(xml).encodeAttribute('MeasureDescription', 'HasDropBox').encodeAttribute('Measure', 'Type').toString();
      },
      parse(xml, reportingPeriodIndex) {
        const xmlObject = super.parseResponse(xml, this.preparse);
        try {
          //@ts-ignore
          if (xmlObject.RT_ERROR[0]['@_ERROR_MESSAGE'][0].includes("The user name or password is incorrect") || xmlObject.RT_ERROR[0]['@_ERROR_MESSAGE'][0].includes("Invalid user id or password")) {
            return new Error("Invalid/Incorrect Username or Password");
          }
          //@ts-ignore
          else {
            return new _RequestException.default(xmlObject);
          }
          ;
        } catch (e) {}
        const response = {};
        response.type = xmlObject.Gradebook[0]['@_Type'][0];
        var _a10 = xmlObject.Gradebook[0].ReportingPeriods[0].ReportPeriod;
        var _f10 = period => {
          return {
            date: {
              start: new Date(period['@_StartDate'][0]),
              end: new Date(period['@_EndDate'][0])
            },
            name: period['@_GradePeriod'][0],
            index: Number(period['@_Index'][0])
          };
        };
        var _r10 = [];
        for (var _i10 = 0; _i10 < _a10.length; _i10++) {
          _r10.push(_f10(_a10[_i10], _i10, _a10));
        }
        var _a11 = xmlObject.Gradebook[0].Courses[0].Course;
        var _f11 = course => {
          return {
            period: Number(course['@_Period'][0]),
            title: _he.default.decode(course['@_Title'][0]),
            room: course['@_Room'][0],
            staff: {
              name: course['@_Staff'][0],
              email: course['@_StaffEMail'][0],
              staffGu: course['@_StaffGU'][0]
            },
            marks: typeof course.Marks[0] !== 'string' ? course.Marks[0].Mark.map(mark => {
              return {
                name: mark['@_MarkName'][0],
                calculatedScore: {
                  string: mark['@_CalculatedScoreString'][0],
                  raw: Number(mark['@_CalculatedScoreRaw'][0])
                },
                weightedCategories: typeof mark['GradeCalculationSummary'][0] !== 'string' ? mark['GradeCalculationSummary'][0].AssignmentGradeCalc.map(weighted => {
                  return {
                    type: _he.default.decode(weighted['@_Type'][0]),
                    calculatedMark: weighted['@_CalculatedMark'][0],
                    weight: {
                      evaluated: weighted['@_WeightedPct'][0],
                      standard: weighted['@_Weight'][0]
                    },
                    points: {
                      current: Number(weighted['@_Points'][0]),
                      possible: Number(weighted['@_PointsPossible'][0])
                    }
                  };
                }) : [],
                assignments: typeof mark.Assignments[0] !== 'string' ? mark.Assignments[0].Assignment.map(assignment => {
                  return {
                    gradebookId: assignment['@_GradebookID'][0],
                    name: decodeURI(assignment['@_Measure'][0]),
                    type: _he.default.decode(assignment['@_Type'][0]),
                    date: {
                      start: new Date(assignment['@_Date'][0]),
                      due: new Date(assignment['@_DueDate'][0])
                    },
                    score: {
                      type: _he.default.decode(assignment['@_ScoreType'][0]),
                      value: assignment['@_Score'] !== undefined ? assignment['@_Score'] : "Not Graded"
                    },
                    points: assignment['@_Points'][0],
                    notes: _he.default.decode(assignment['@_Notes'][0]),
                    teacherId: assignment['@_TeacherID'][0],
                    description: decodeURI(assignment['@_MeasureDescription'][0]),
                    hasDropbox: JSON.parse(assignment['@_HasDropBox'][0]),
                    studentId: assignment['@_StudentID'][0],
                    dropboxDate: {
                      start: new Date(assignment['@_DropStartDate'][0]),
                      end: new Date(assignment['@_DropEndDate'][0])
                    },
                    resources: typeof assignment.Resources[0] !== 'string' ?
                    /*(assignment.Resources[0].Resource.map((rsrc:any) => {
                      switch (rsrc['@_Type'][0]) {
                        case 'File': {
                          const fileRsrc = rsrc as FileResourceXMLObject;
                          return {
                            type: ResourceType.FILE,
                            file: {
                              type: fileRsrc['@_FileType'][0],
                              name: fileRsrc['@_FileName'][0],
                              uri: this.hostUrl + fileRsrc['@_ServerFileName'][0],
                            },
                            resource: {
                              date: new Date(fileRsrc['@_ResourceDate'][0]),
                              id: fileRsrc['@_ResourceID'][0],
                              name: fileRsrc['@_ResourceName'][0],
                            },
                          } as FileResource;
                        }
                        case 'URL': {
                          const urlRsrc = rsrc as URLResourceXMLObject;
                          return {
                            url: urlRsrc['@_URL'] !== undefined ? urlRsrc['@_URL'] : "Not Given",
                            type: ResourceType.URL,
                            resource: {
                              date: new Date(urlRsrc['@_ResourceDate'][0]),
                              id: urlRsrc['@_ResourceID'][0],
                              name: urlRsrc['@_ResourceName'][0],
                              description: urlRsrc['@_ResourceDescription'][0],
                            },
                            path: urlRsrc['@_ServerFileName'][0],
                          } as URLResource;
                        }
                        default:
                          rej(
                            `Type ${rsrc['@_Type'][0]} does not exist as a type. Add it to type declarations.`
                          );
                      }
                    }) as (FileResource | URLResource)[]) */
                    //Obviously this is an insanely negligent fix. Just saying to complete hell with the resource. But, grade melon doesn't use it. So I don't care.
                    [] : []
                  };
                }) : []
              };
            }) : [{
              name: "none",
              calculatedScore: {
                string: "none",
                raw: NaN
              },
              weightedCategories: [],
              assignments: []
            }]
          };
        };
        var _r11 = [];
        for (var _i11 = 0; _i11 < _a11.length; _i11++) {
          _r11.push(_f11(_a11[_i11], _i11, _a11));
        }
        response.reportingPeriod = {
          current: {
            index: reportingPeriodIndex ?? Number(xmlObject.Gradebook[0].ReportingPeriods[0].ReportPeriod.find(x => {
              return x['@_GradePeriod'][0] === xmlObject.Gradebook[0].ReportingPeriod[0]['@_GradePeriod'][0];
            })?.['@_Index'][0]),
            date: {
              start: new Date(xmlObject.Gradebook[0].ReportingPeriod[0]['@_StartDate'][0]),
              end: new Date(xmlObject.Gradebook[0].ReportingPeriod[0]['@_EndDate'][0])
            },
            name: xmlObject.Gradebook[0].ReportingPeriod[0]['@_GradePeriod'][0]
          },
          available: _r10
        }, response.courses = _r11;
        return response;
      }
    });

    /**
     * Get a list of messages of the student
     * @returns {Promise<Message[]>} Returns an array of messages of the student
     * @description
     * ```js
     * await client.messages(); // -> [{ id: 'E972F1BC-99A0-4CD0-8D15-B18968B43E08', type: 'StudentActivity', ... }, { id: '86FDA11D-42C7-4249-B003-94B15EB2C8D4', type: 'StudentActivity', ... }]
     * ```
     */
    messages() {
      return new Promise((res, rej) => {
        super.processRequest({
          methodName: 'GetPXPMessages',
          paramStr: {
            childIntId: 0
          }
        }, xml => {
          return new _XMLFactory.default(xml).encodeAttribute('Content', 'Read').toString();
        }).then(xmlObject => {
          var _a12 = xmlObject.PXPMessagesData[0].MessageListings[0].MessageListing;
          var _f12 = message => {
            return new _Message.default(message, super.credentials, this.hostUrl);
          }
          // @ts-ignore //fucking sue me
          ;
          var _r12 = [];
          for (var _i12 = 0; _i12 < _a12.length; _i12++) {
            _r12.push(_f12(_a12[_i12], _i12, _a12));
          }
          res([_r12, xmlObject?.extraData]);
        }).catch(rej);
      });
    }

    //altnerate method for studentInfo when studentInfo fails:
    //those things commented out are not applicable here
    ChildList() {
      return new Promise((res, rej) => {
        super.processRequest({
          methodName: "ChildList"
        }).then(xmlObject => {
          const raw = xmlObject;
          xmlObject = xmlObject.ChildList[0];
          res([{
            student: {
              name: xmlObject.Child[0].ChildName,
              //full Name on this fallback method
              lastName: "not available",
              nickname: "not available"
            },
            //  birthDate:new Date(),
            // track:"not available",
            // address:"not available",
            photo: (0, _Client.optional)(xmlObject.Child[0].photo),
            counselor: undefined,
            currentSchool: xmlObject.Child[0].OrganizationName[0],
            // dentist:undefined,
            // physician:undefined,
            id: (0, _Client.optional)(xmlObject.Child[0]['@_ChildPermID']),
            orgYearGu: (0, _Client.optional)(xmlObject.Child[0]['@_OrgYearGU']),
            //phone:"not available",
            //email:"not available",
            //emergencyContacts:undefined,
            gender: "null",
            grade: (0, _Client.optional)(xmlObject.Child[0].Grade)
          }, raw.extraData]);
        }).catch(rej);
      });
    }

    /**
     * Gets the info of a student
     * @returns {Promise<StudentInfo>} StudentInfo object
     * @description
     * ```js
     * studentInfo().then(console.log) // -> { student: { name: 'Evan Davis', nickname: '', lastName: 'Davis' }, ...}
     * ```
     */
    studentInfo() {
      return new Promise((res, rej) => {
        super.processRequest({
          methodName: 'StudentInfo',
          paramStr: {
            childIntId: 0
          }
        }).then(xmlObjectData => {
          res([{
            student: {
              name: xmlObjectData.StudentInfo[0].FormattedName[0],
              lastName: xmlObjectData.StudentInfo[0].LastNameGoesBy[0],
              nickname: xmlObjectData.StudentInfo[0].NickName[0]
            },
            birthDate: new Date(xmlObjectData.StudentInfo[0].BirthDate[0]),
            track: (0, _Client.optional)(xmlObjectData.StudentInfo[0].Track),
            address: (0, _Client.optional)(xmlObjectData.StudentInfo[0].Address),
            photo: (0, _Client.optional)(xmlObjectData.StudentInfo[0].Photo),
            counselor: xmlObjectData.StudentInfo[0].CounselorName && xmlObjectData.StudentInfo[0].CounselorEmail && xmlObjectData.StudentInfo[0].CounselorStaffGU ? {
              name: xmlObjectData.StudentInfo[0].CounselorName[0],
              email: xmlObjectData.StudentInfo[0].CounselorEmail[0],
              staffGu: xmlObjectData.StudentInfo[0].CounselorStaffGU[0]
            } : undefined,
            currentSchool: xmlObjectData.StudentInfo[0].CurrentSchool[0],
            dentist: xmlObjectData.StudentInfo[0].Dentist ? {
              name: xmlObjectData.StudentInfo[0].Dentist[0]['@_Name'][0],
              phone: xmlObjectData.StudentInfo[0].Dentist[0]['@_Phone'][0],
              extn: xmlObjectData.StudentInfo[0].Dentist[0]['@_Extn'][0],
              office: xmlObjectData.StudentInfo[0].Dentist[0]['@_Office'][0]
            } : undefined,
            physician: xmlObjectData.StudentInfo[0].Physician ? {
              name: xmlObjectData.StudentInfo[0].Physician[0]['@_Name'][0],
              phone: xmlObjectData.StudentInfo[0].Physician[0]['@_Phone'][0],
              extn: xmlObjectData.StudentInfo[0].Physician[0]['@_Extn'][0],
              hospital: xmlObjectData.StudentInfo[0].Physician[0]['@_Hospital'][0]
            } : undefined,
            id: (0, _Client.optional)(xmlObjectData.StudentInfo[0].PermID),
            orgYearGu: (0, _Client.optional)(xmlObjectData.StudentInfo[0].OrgYearGU),
            phone: (0, _Client.optional)(xmlObjectData.StudentInfo[0].Phone),
            email: (0, _Client.optional)(xmlObjectData.StudentInfo[0].EMail),
            emergencyContacts: xmlObjectData.StudentInfo[0].EmergencyContacts ? xmlObjectData.StudentInfo[0].EmergencyContacts[0].EmergencyContact?.map(contact => {
              return {
                name: (0, _Client.optional)(contact['@_Name']),
                phone: {
                  home: (0, _Client.optional)(contact['@_HomePhone']),
                  mobile: (0, _Client.optional)(contact['@_MobilePhone']),
                  other: (0, _Client.optional)(contact['@_OtherPhone']),
                  work: (0, _Client.optional)(contact['@_WorkPhone'])
                },
                relationship: (0, _Client.optional)(contact['@_Relationship'])
              };
            }) : [],
            gender: (0, _Client.optional)(xmlObjectData.StudentInfo[0].Gender),
            grade: (0, _Client.optional)(xmlObjectData.StudentInfo[0].Grade),
            lockerInfoRecords: (0, _Client.optional)(xmlObjectData.StudentInfo[0].LockerInfoRecords),
            homeLanguage: (0, _Client.optional)(xmlObjectData.StudentInfo[0].HomeLanguage),
            homeRoom: (0, _Client.optional)(xmlObjectData.StudentInfo[0].HomeRoom),
            homeRoomTeacher: {
              email: (0, _Client.optional)(xmlObjectData.StudentInfo[0].HomeRoomTchEMail),
              name: (0, _Client.optional)(xmlObjectData.StudentInfo[0].HomeRoomTch),
              staffGu: (0, _Client.optional)(xmlObjectData.StudentInfo[0].HomeRoomTchStaffGU)
            },
            additionalInfo: xmlObjectData.StudentInfo[0].UserDefinedGroupBoxes[0].UserDefinedGroupBox ? xmlObjectData.StudentInfo[0].UserDefinedGroupBoxes[0].UserDefinedGroupBox.map(definedBox => {
              return {
                id: (0, _Client.optional)(definedBox['@_GroupBoxID']),
                // string | undefined
                type: definedBox['@_GroupBoxLabel'][0],
                // string
                vcId: (0, _Client.optional)(definedBox['@_VCID']),
                // string | undefined
                items: definedBox.UserDefinedItems[0].UserDefinedItem.map(item => {
                  return {
                    source: {
                      element: item['@_SourceElement'][0],
                      object: item['@_SourceObject'][0]
                    },
                    vcId: item['@_VCID'][0],
                    value: item['@_Value'][0],
                    type: item['@_ItemType'][0]
                  };
                })
              };
            }) : []
            //@ts-ignore You will never make me use typeScript.
          }, xmlObjectData.extraData]);
        }).catch(rej);
      });
    }
    fetchEventsWithinInterval(date) {
      return super.processRequest({
        methodName: 'StudentCalendar',
        paramStr: {
          childIntId: 0,
          RequestDate: date.toISOString()
        }
      }, xml => {
        return new _XMLFactory.default(xml).encodeAttribute('Title', 'Icon').toString();
      });
    }

    /**
     *
     * @param {CalendarOptions} options Options to provide for calendar method. An interval is required.
     * @returns {Promise<Calendar>} Returns a Calendar object
     * @description
     * ```js
     * client.calendar({ interval: { start: new Date('5/1/2022'), end: new Date('8/1/2021') }, concurrency: null }); // -> Limitless concurrency (not recommended)
     *
     * const calendar = await client.calendar({ interval: { ... }});
     * console.log(calendar); // -> { schoolDate: {...}, outputRange: {...}, events: [...] }
     * ```
     */
    async calendar(options = {}) {
      const defaultOptions = {
        concurrency: 7,
        ...options
      };
      const cal = await _cache.default.memo(() => {
        return this.fetchEventsWithinInterval(new Date());
      });
      const schoolEndDate = options.interval?.end ?? new Date(cal.CalendarListing[0]['@_SchoolEndDate'][0]);
      const schoolStartDate = options.interval?.start ?? new Date(cal.CalendarListing[0]['@_SchoolBegDate'][0]);
      return new Promise((res, rej) => {
        const monthsWithinSchoolYear = (0, _dateFns.eachMonthOfInterval)({
          start: schoolStartDate,
          end: schoolEndDate
        });
        const getAllEventsWithinSchoolYear = () => {
          return defaultOptions.concurrency == null ? Promise.all(monthsWithinSchoolYear.map(date => {
            return this.fetchEventsWithinInterval(date);
          })) : (0, _Client.asyncPoolAll)(defaultOptions.concurrency, monthsWithinSchoolYear, date => {
            return this.fetchEventsWithinInterval(date);
          });
        };
        let memo = null;
        getAllEventsWithinSchoolYear().then(events => {
          const allEvents = events.reduce((prev, events) => {
            if (memo == null) {
              memo = {
                schoolDate: {
                  start: new Date(events.CalendarListing[0]['@_SchoolBegDate'][0]),
                  end: new Date(events.CalendarListing[0]['@_SchoolEndDate'][0])
                },
                outputRange: {
                  start: schoolStartDate,
                  end: schoolEndDate
                },
                events: []
              };
            }
            const rest = {
              ...memo,
              // This is to prevent re-initializing Date objects in order to improve performance
              events: [...(prev.events ? prev.events : []), ...(typeof events.CalendarListing[0].EventLists[0] !== 'string' ? events.CalendarListing[0].EventLists[0].EventList.map(event => {
                switch (event['@_DayType'][0]) {
                  case _EventType.default.ASSIGNMENT:
                    {
                      const assignmentEvent = event;
                      return {
                        title: decodeURI(assignmentEvent['@_Title'][0]),
                        addLinkData: assignmentEvent['@_AddLinkData'][0],
                        agu: assignmentEvent['@_AGU'] ? assignmentEvent['@_AGU'][0] : undefined,
                        date: new Date(assignmentEvent['@_Date'][0]),
                        dgu: assignmentEvent['@_DGU'][0],
                        link: assignmentEvent['@_Link'][0],
                        startTime: assignmentEvent['@_StartTime'][0],
                        type: _EventType.default.ASSIGNMENT,
                        viewType: assignmentEvent['@_ViewType'][0]
                      };
                    }
                  case _EventType.default.HOLIDAY:
                    {
                      return {
                        title: decodeURI(event['@_Title'][0]),
                        type: _EventType.default.HOLIDAY,
                        startTime: event['@_StartTime'][0],
                        date: new Date(event['@_Date'][0])
                      };
                    }
                  case _EventType.default.REGULAR:
                    {
                      const regularEvent = event;
                      return {
                        title: decodeURI(regularEvent['@_Title'][0]),
                        agu: regularEvent['@_AGU'] ? regularEvent['@_AGU'][0] : undefined,
                        date: new Date(regularEvent['@_Date'][0]),
                        description: regularEvent['@_EvtDescription'] ? regularEvent['@_EvtDescription'][0] : undefined,
                        dgu: regularEvent['@_DGU'] ? regularEvent['@_DGU'][0] : undefined,
                        link: regularEvent['@_Link'] ? regularEvent['@_Link'][0] : undefined,
                        startTime: regularEvent['@_StartTime'][0],
                        type: _EventType.default.REGULAR,
                        viewType: regularEvent['@_ViewType'] ? regularEvent['@_ViewType'][0] : undefined,
                        addLinkData: regularEvent['@_AddLinkData'] ? regularEvent['@_AddLinkData'][0] : undefined
                      };
                    }
                }
              }) : [])]
            };
            return rest;
          }, {});
          res({
            ...allEvents,
            events: _lodash.default.uniqBy(allEvents.events, item => {
              return item.title;
            })
          });
        }).catch(rej);
      });
    }
  }
  _exports.default = Client;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDbGllbnQiLCJzb2FwIiwiY29uc3RydWN0b3IiLCJjcmVkZW50aWFscyIsInByb3h5VXJsIiwiaG9zdFVybCIsInZhbGlkYXRlQ3JlZGVudGlhbHMiLCJQcm9taXNlIiwicmVzIiwicmVqIiwicHJvY2Vzc1JlcXVlc3QiLCJ2YWxpZGF0ZUVycm9ycyIsIm1ldGhvZE5hbWUiLCJ0aGVuIiwicmVzcG9uc2UiLCJSVF9FUlJPUiIsImluY2x1ZGVzIiwiUmVxdWVzdEV4Y2VwdGlvbiIsImNhdGNoIiwiZG9jdW1lbnRzIiwicGFyYW1TdHIiLCJjaGlsZEludElkIiwieG1sT2JqZWN0IiwiU3R1ZGVudERvY3VtZW50RGF0YXMiLCJjb25zb2xlIiwibG9nIiwiZXh0cmFEYXRhIiwiU3R1ZGVudERvY3VtZW50RGF0YSIsInhtbCIsIkRvY3VtZW50IiwicmVwb3J0Q2FyZHMiLCJSQ1JlcG9ydGluZ1BlcmlvZERhdGEiLCJSQ1JlcG9ydGluZ1BlcmlvZHMiLCJSQ1JlcG9ydGluZ1BlcmlvZCIsIlJlcG9ydENhcmQiLCJzY2hvb2xJbmZvIiwiY2hpbGRJbnRJRCIsInJlc3VsdCIsIlN0dWRlbnRTY2hvb2xJbmZvTGlzdGluZyIsIlN0YWZmTGlzdHMiLCJTdGFmZkxpc3QiLCJzdGFmZiIsIm5hbWUiLCJlbWFpbCIsInN0YWZmR3UiLCJqb2JUaXRsZSIsImV4dG4iLCJwaG9uZSIsInNjaG9vbCIsImFkZHJlc3MiLCJhZGRyZXNzQWx0IiwiY2l0eSIsInppcENvZGUiLCJhbHRQaG9uZSIsInByaW5jaXBhbCIsInNjaGVkdWxlIiwidGVybUluZGV4IiwiVGVybUluZGV4IiwidGVybU5hbWUiLCJTdHVkZW50Q2xhc3NTY2hlZHVsZSIsIlRlcm1MaXN0cyIsIlRlcm1MaXN0aW5nIiwidGVybSIsInN0YXJ0IiwiZW5kIiwidGVybXMiLCJDbGFzc0xpc3RzIiwiQ2xhc3NMaXN0aW5nIiwiY291cnNlIiwicGVyaW9kIiwidGVhY2hlciIsInJvb20iLCJtYWluQ2xhc3NlcyIsImNoZWNrZXIiLCJDb25jdXJyZW50U2Nob29sU3R1ZGVudENsYXNzU2NoZWR1bGVzIiwiQ29uY3VycmVudFNjaG9vbFN0dWRlbnRDbGFzc1NjaGVkdWxlIiwiQ29uU2NoQ2xhc3NMaXN0cyIsImNvbkNsYXNzZXMiLCJjb25OYW1lIiwiVG9kYXlTY2hlZHVsZUluZm9EYXRhIiwiU2Nob29sSW5mb3MiLCJ0b2RheSIsIlNjaG9vbEluZm8iLCJDbGFzc2VzIiwiQ2xhc3NJbmZvIiwibWFpbiIsImNvbiIsIlNjaG9vbGluZm8iLCJlcnJvciIsImF0dGVuZGFuY2UiLCJhdHRlbmRhbmNlWE1MT2JqZWN0IiwiQXR0ZW5kYW5jZSIsIlRvdGFsQWN0aXZpdGllcyIsIlBlcmlvZFRvdGFsIiwicGQiLCJpIiwiTnVtYmVyIiwidG90YWwiLCJleGN1c2VkIiwiVG90YWxFeGN1c2VkIiwidGFyZGllcyIsIlRvdGFsVGFyZGllcyIsInVuZXhjdXNlZCIsIlRvdGFsVW5leGN1c2VkIiwiYWN0aXZpdGllcyIsInVuZXhjdXNlZFRhcmRpZXMiLCJUb3RhbFVuZXhjdXNlZFRhcmRpZXMiLCJ0eXBlIiwic2Nob29sTmFtZSIsImFic2VuY2VzIiwiQWJzZW5jZXMiLCJBYnNlbmNlIiwibWFwIiwiYWJzZW5jZSIsImRhdGUiLCJEYXRlIiwicmVhc29uIiwibm90ZSIsImRlc2NyaXB0aW9uIiwicGVyaW9kcyIsIlBlcmlvZHMiLCJQZXJpb2QiLCJvcmdZZWFyR3UiLCJwZXJpb2RJbmZvcyIsImdyYWRlYm9vayIsIk9iamVjdCIsImFzc2lnbiIsInJlcG9ydGluZ1BlcmlvZEluZGV4IiwiUmVwb3J0UGVyaW9kIiwiQ29uY3VycmVudFNjaE9yZ1llYXJHVSIsInJhd1htbCIsInByZXBhcnNlIiwiWE1MRmFjdG9yeSIsImVuY29kZUF0dHJpYnV0ZSIsInRvU3RyaW5nIiwicGFyc2UiLCJwYXJzZVJlc3BvbnNlIiwiRXJyb3IiLCJlIiwiR3JhZGVib29rIiwiUmVwb3J0aW5nUGVyaW9kcyIsImluZGV4IiwiQ291cnNlcyIsIkNvdXJzZSIsInRpdGxlIiwiaGUiLCJkZWNvZGUiLCJtYXJrcyIsIk1hcmtzIiwiTWFyayIsIm1hcmsiLCJjYWxjdWxhdGVkU2NvcmUiLCJzdHJpbmciLCJyYXciLCJ3ZWlnaHRlZENhdGVnb3JpZXMiLCJBc3NpZ25tZW50R3JhZGVDYWxjIiwid2VpZ2h0ZWQiLCJjYWxjdWxhdGVkTWFyayIsIndlaWdodCIsImV2YWx1YXRlZCIsInN0YW5kYXJkIiwicG9pbnRzIiwiY3VycmVudCIsInBvc3NpYmxlIiwiYXNzaWdubWVudHMiLCJBc3NpZ25tZW50cyIsIkFzc2lnbm1lbnQiLCJhc3NpZ25tZW50IiwiZ3JhZGVib29rSWQiLCJkZWNvZGVVUkkiLCJkdWUiLCJzY29yZSIsInZhbHVlIiwidW5kZWZpbmVkIiwibm90ZXMiLCJ0ZWFjaGVySWQiLCJoYXNEcm9wYm94IiwiSlNPTiIsInN0dWRlbnRJZCIsImRyb3Bib3hEYXRlIiwicmVzb3VyY2VzIiwiUmVzb3VyY2VzIiwiTmFOIiwicmVwb3J0aW5nUGVyaW9kIiwiZmluZCIsIngiLCJSZXBvcnRpbmdQZXJpb2QiLCJhdmFpbGFibGUiLCJjb3Vyc2VzIiwibWVzc2FnZXMiLCJQWFBNZXNzYWdlc0RhdGEiLCJNZXNzYWdlTGlzdGluZ3MiLCJNZXNzYWdlTGlzdGluZyIsIm1lc3NhZ2UiLCJNZXNzYWdlIiwiQ2hpbGRMaXN0Iiwic3R1ZGVudCIsIkNoaWxkIiwiQ2hpbGROYW1lIiwibGFzdE5hbWUiLCJuaWNrbmFtZSIsInBob3RvIiwib3B0aW9uYWwiLCJjb3Vuc2Vsb3IiLCJjdXJyZW50U2Nob29sIiwiT3JnYW5pemF0aW9uTmFtZSIsImlkIiwiZ2VuZGVyIiwiZ3JhZGUiLCJHcmFkZSIsInN0dWRlbnRJbmZvIiwieG1sT2JqZWN0RGF0YSIsIlN0dWRlbnRJbmZvIiwiRm9ybWF0dGVkTmFtZSIsIkxhc3ROYW1lR29lc0J5IiwiTmlja05hbWUiLCJiaXJ0aERhdGUiLCJCaXJ0aERhdGUiLCJ0cmFjayIsIlRyYWNrIiwiQWRkcmVzcyIsIlBob3RvIiwiQ291bnNlbG9yTmFtZSIsIkNvdW5zZWxvckVtYWlsIiwiQ291bnNlbG9yU3RhZmZHVSIsIkN1cnJlbnRTY2hvb2wiLCJkZW50aXN0IiwiRGVudGlzdCIsIm9mZmljZSIsInBoeXNpY2lhbiIsIlBoeXNpY2lhbiIsImhvc3BpdGFsIiwiUGVybUlEIiwiT3JnWWVhckdVIiwiUGhvbmUiLCJFTWFpbCIsImVtZXJnZW5jeUNvbnRhY3RzIiwiRW1lcmdlbmN5Q29udGFjdHMiLCJFbWVyZ2VuY3lDb250YWN0IiwiY29udGFjdCIsImhvbWUiLCJtb2JpbGUiLCJvdGhlciIsIndvcmsiLCJyZWxhdGlvbnNoaXAiLCJHZW5kZXIiLCJsb2NrZXJJbmZvUmVjb3JkcyIsIkxvY2tlckluZm9SZWNvcmRzIiwiaG9tZUxhbmd1YWdlIiwiSG9tZUxhbmd1YWdlIiwiaG9tZVJvb20iLCJIb21lUm9vbSIsImhvbWVSb29tVGVhY2hlciIsIkhvbWVSb29tVGNoRU1haWwiLCJIb21lUm9vbVRjaCIsIkhvbWVSb29tVGNoU3RhZmZHVSIsImFkZGl0aW9uYWxJbmZvIiwiVXNlckRlZmluZWRHcm91cEJveGVzIiwiVXNlckRlZmluZWRHcm91cEJveCIsImRlZmluZWRCb3giLCJ2Y0lkIiwiaXRlbXMiLCJVc2VyRGVmaW5lZEl0ZW1zIiwiVXNlckRlZmluZWRJdGVtIiwiaXRlbSIsInNvdXJjZSIsImVsZW1lbnQiLCJvYmplY3QiLCJmZXRjaEV2ZW50c1dpdGhpbkludGVydmFsIiwiUmVxdWVzdERhdGUiLCJ0b0lTT1N0cmluZyIsImNhbGVuZGFyIiwib3B0aW9ucyIsImRlZmF1bHRPcHRpb25zIiwiY29uY3VycmVuY3kiLCJjYWwiLCJjYWNoZSIsIm1lbW8iLCJzY2hvb2xFbmREYXRlIiwiaW50ZXJ2YWwiLCJDYWxlbmRhckxpc3RpbmciLCJzY2hvb2xTdGFydERhdGUiLCJtb250aHNXaXRoaW5TY2hvb2xZZWFyIiwiZWFjaE1vbnRoT2ZJbnRlcnZhbCIsImdldEFsbEV2ZW50c1dpdGhpblNjaG9vbFllYXIiLCJhbGwiLCJhc3luY1Bvb2xBbGwiLCJldmVudHMiLCJhbGxFdmVudHMiLCJyZWR1Y2UiLCJwcmV2Iiwic2Nob29sRGF0ZSIsIm91dHB1dFJhbmdlIiwicmVzdCIsIkV2ZW50TGlzdHMiLCJFdmVudExpc3QiLCJldmVudCIsIkV2ZW50VHlwZSIsIkFTU0lHTk1FTlQiLCJhc3NpZ25tZW50RXZlbnQiLCJhZGRMaW5rRGF0YSIsImFndSIsImRndSIsImxpbmsiLCJzdGFydFRpbWUiLCJ2aWV3VHlwZSIsIkhPTElEQVkiLCJSRUdVTEFSIiwicmVndWxhckV2ZW50IiwiXyIsInVuaXFCeSJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9TdHVkZW50VnVlL0NsaWVudC9DbGllbnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTG9naW5DcmVkZW50aWFscywgUGFyc2VkUmVxdWVzdEVycm9yIH0gZnJvbSAnLi4vLi4vdXRpbHMvc29hcC9DbGllbnQvQ2xpZW50LmludGVyZmFjZXMnO1xyXG5pbXBvcnQgc29hcCBmcm9tICcuLi8uLi91dGlscy9zb2FwL3NvYXAnO1xyXG5pbXBvcnQgeyBBZGRpdGlvbmFsSW5mbywgQWRkaXRpb25hbEluZm9JdGVtLCBDbGFzc1NjaGVkdWxlSW5mbywgU2Nob29sSW5mbywgU3R1ZGVudEluZm8gfSBmcm9tICcuL0NsaWVudC5pbnRlcmZhY2VzJztcclxuaW1wb3J0IHsgU3R1ZGVudEluZm9YTUxPYmplY3QgfSBmcm9tICcuL0ludGVyZmFjZXMveG1sL1N0dWRlbnRJbmZvJztcclxuaW1wb3J0IE1lc3NhZ2UgZnJvbSAnLi4vTWVzc2FnZS9NZXNzYWdlJztcclxuaW1wb3J0IHsgTWVzc2FnZVhNTE9iamVjdCB9IGZyb20gJy4uL01lc3NhZ2UvTWVzc2FnZS54bWwnO1xyXG5pbXBvcnQgeyBBc3NpZ25tZW50RXZlbnRYTUxPYmplY3QsIENhbGVuZGFyWE1MT2JqZWN0LCBSZWd1bGFyRXZlbnRYTUxPYmplY3QgfSBmcm9tICcuL0ludGVyZmFjZXMveG1sL0NhbGVuZGFyJztcclxuaW1wb3J0IHsgQXNzaWdubWVudEV2ZW50LCBDYWxlbmRhciwgQ2FsZW5kYXJPcHRpb25zLCBFdmVudCwgSG9saWRheUV2ZW50LCBSZWd1bGFyRXZlbnQgfSBmcm9tICcuL0ludGVyZmFjZXMvQ2FsZW5kYXInO1xyXG5pbXBvcnQgeyBlYWNoTW9udGhPZkludGVydmFsLCBwYXJzZSB9IGZyb20gJ2RhdGUtZm5zJztcclxuaW1wb3J0IHsgRmlsZVJlc291cmNlWE1MT2JqZWN0LCBHcmFkZWJvb2tYTUxPYmplY3QsIFVSTFJlc291cmNlWE1MT2JqZWN0IH0gZnJvbSAnLi9JbnRlcmZhY2VzL3htbC9HcmFkZWJvb2snO1xyXG5pbXBvcnQgeyBBdHRlbmRhbmNlWE1MT2JqZWN0IH0gZnJvbSAnLi9JbnRlcmZhY2VzL3htbC9BdHRlbmRhbmNlJztcclxuaW1wb3J0IEV2ZW50VHlwZSBmcm9tICcuLi8uLi9Db25zdGFudHMvRXZlbnRUeXBlJztcclxuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcclxuaW1wb3J0IHsgQXNzaWdubWVudCwgRmlsZVJlc291cmNlLCBHcmFkZWJvb2ssIE1hcmssIFVSTFJlc291cmNlLCBXZWlnaHRlZENhdGVnb3J5IH0gZnJvbSAnLi9JbnRlcmZhY2VzL0dyYWRlYm9vayc7XHJcbmltcG9ydCBSZXNvdXJjZVR5cGUgZnJvbSAnLi4vLi4vQ29uc3RhbnRzL1Jlc291cmNlVHlwZSc7XHJcbmltcG9ydCB7IEFic2VudFBlcmlvZCwgQXR0ZW5kYW5jZSwgUGVyaW9kSW5mbyB9IGZyb20gJy4vSW50ZXJmYWNlcy9BdHRlbmRhbmNlJztcclxuaW1wb3J0IHsgU2NoZWR1bGVYTUxPYmplY3QgfSBmcm9tICcuL0ludGVyZmFjZXMveG1sL1NjaGVkdWxlJztcclxuaW1wb3J0IHsgU2NoZWR1bGUgfSBmcm9tICcuL0NsaWVudC5pbnRlcmZhY2VzJztcclxuaW1wb3J0IHsgU2Nob29sSW5mb1hNTE9iamVjdCB9IGZyb20gJy4vSW50ZXJmYWNlcy94bWwvU2Nob29sSW5mbyc7XHJcbmltcG9ydCB7IFJlcG9ydENhcmRzWE1MT2JqZWN0IH0gZnJvbSAnLi4vUmVwb3J0Q2FyZC9SZXBvcnRDYXJkLnhtbCc7XHJcbmltcG9ydCB7IERvY3VtZW50WE1MT2JqZWN0IH0gZnJvbSAnLi4vRG9jdW1lbnQvRG9jdW1lbnQueG1sJztcclxuaW1wb3J0IFJlcG9ydENhcmQgZnJvbSAnLi4vUmVwb3J0Q2FyZC9SZXBvcnRDYXJkJztcclxuaW1wb3J0IERvY3VtZW50IGZyb20gJy4uL0RvY3VtZW50L0RvY3VtZW50JztcclxuaW1wb3J0IFJlcXVlc3RFeGNlcHRpb24gZnJvbSAnLi4vUmVxdWVzdEV4Y2VwdGlvbi9SZXF1ZXN0RXhjZXB0aW9uJztcclxuaW1wb3J0IFhNTEZhY3RvcnkgZnJvbSAnLi4vLi4vdXRpbHMvWE1MRmFjdG9yeS9YTUxGYWN0b3J5JztcclxuaW1wb3J0IGNhY2hlIGZyb20gJy4uLy4uL3V0aWxzL2NhY2hlL2NhY2hlJztcclxuaW1wb3J0IHsgb3B0aW9uYWwsIGFzeW5jUG9vbEFsbCB9IGZyb20gJy4vQ2xpZW50LmhlbHBlcnMnO1xyXG5pbXBvcnQgaGUgZnJvbSBcImhlXCI7XHJcbmltcG9ydCB6b2QgZnJvbSBcInpvZFwiXHJcblxyXG5cclxuLyoqXHJcbiAqIFRPIERPOyByZXdyaXRlIHRoZSBzdHVkZW50SW5mbyBzdHVmZiB0byBwcmltYXJ5IENoaWxkTGlzdCB3aXRoIHN0dWRlbnRJbmZvIGFzIHRoZSBmYWxsYmFjaywgXHJcbiAqIG1ha2UgdGhlIHR5cGUgUkVRVUlSRSB0aGUgaW5mbyBhYm91dCBzY2hvb2wgY29uY3VycmVuY3ksIHRodXNseSwgdGhlIGxvZ2luIGZ1bmN0aW9uIHdpbGwgZGV0ZXJtaW5lIGl0IGluIHRoZSBpbW1lZGlhdGUgYnkgY29uY3VycmVucnRseSBwZXJmb3JtaW5nIHRoZSBmZXRjaGVzXHJcbiAqIHRvIHRodXNseSBoYXZlIGEgbWluaW1hbCBzcGVlZCBpbXBhY3RcclxuICogXHJcbiAqIFxyXG4gKiBcclxuICogXHJcbiAqIFxyXG4gKiBcclxuICogXHJcbiAqIFxyXG4gKiBcclxuICogXHJcbiAqIFxyXG4gKiBcclxuICogXHJcbiAqIFxyXG4gKiBcclxuICogXHJcbiAqIFxyXG4gKiBcclxuICogXHJcbiAqIFRoZSBTdHVkZW50VlVFIENsaWVudCB0byBhY2Nlc3MgdGhlIEFQSVxyXG4gKiBAY29uc3RydWN0b3JcclxuICogQGV4dGVuZHMge3NvYXAuQ2xpZW50fVxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2xpZW50IGV4dGVuZHMgc29hcC5DbGllbnQge1xyXG4gIHByaXZhdGUgaG9zdFVybDogc3RyaW5nO1xyXG4gIGNvbnN0cnVjdG9yKGNyZWRlbnRpYWxzOiBMb2dpbkNyZWRlbnRpYWxzLCBwcm94eVVybDpzdHJpbmcsaG9zdFVybDogc3RyaW5nKSB7XHJcbiAgICBzdXBlcihjcmVkZW50aWFscyxwcm94eVVybCk7XHJcbiAgICB0aGlzLmhvc3RVcmwgPSBob3N0VXJsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVmFsaWRhdGUncyB0aGUgdXNlcidzIGNyZWRlbnRpYWxzLiBJdCB3aWxsIHRocm93IGFuIGVycm9yIGlmIGNyZWRlbnRpYWxzIGFyZSBpbmNvcnJlY3RcclxuICAgKi9cclxuICBwdWJsaWMgdmFsaWRhdGVDcmVkZW50aWFscygpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IHtcclxuICAgICAgc3VwZXJcclxuICAgICAgICAucHJvY2Vzc1JlcXVlc3Q8UGFyc2VkUmVxdWVzdEVycm9yPih7IHZhbGlkYXRlRXJyb3JzOiBmYWxzZSwgbWV0aG9kTmFtZTogJ2Z1Y2snfSlcclxuICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgIGlmIChyZXNwb25zZS5SVF9FUlJPUlswXVsnQF9FUlJPUl9NRVNTQUdFJ11bMF0uaW5jbHVkZXMoXCJBIGNyaXRpY2FsIGVycm9yIGhhcyBvY2N1cnJlZFwiKSkge3JlcygpO31cclxuICAgICAgICAgIGVsc2V7cmVqKG5ldyBSZXF1ZXN0RXhjZXB0aW9uKHJlc3BvbnNlKSl9O1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKHJlaik7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIHN0dWRlbnQncyBkb2N1bWVudHMgZnJvbSBzeW5lcmd5IHNlcnZlcnNcclxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxEb2N1bWVudFtdPn0+IFJldHVybnMgYSBsaXN0IG9mIHN0dWRlbnQgZG9jdW1lbnRzXHJcbiAgICogQGRlc2NyaXB0aW9uXHJcbiAgICogYGBganNcclxuICAgKiBjb25zdCBkb2N1bWVudHMgPSBhd2FpdCBjbGllbnQuZG9jdW1lbnRzKCk7XHJcbiAgICogY29uc3QgZG9jdW1lbnQgPSBkb2N1bWVudHNbMF07XHJcbiAgICogY29uc3QgZmlsZXMgPSBhd2FpdCBkb2N1bWVudC5nZXQoKTtcclxuICAgKiBjb25zdCBiYXNlNjRjb2xsZWN0aW9uID0gZmlsZXMubWFwKChmaWxlKSA9PiBmaWxlLmJhc2U2NCk7XHJcbiAgICogYGBgXHJcbiAgICovXHJcbiAgcHVibGljIGRvY3VtZW50cygpOiBQcm9taXNlPFtEb2N1bWVudFtdLGFueV0+IHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IHtcclxuICAgICAgc3VwZXJcclxuICAgICAgICAucHJvY2Vzc1JlcXVlc3Q8RG9jdW1lbnRYTUxPYmplY3Q+KHtcclxuICAgICAgICAgIG1ldGhvZE5hbWU6ICdHZXRTdHVkZW50RG9jdW1lbnRJbml0aWFsRGF0YScsXHJcbiAgICAgICAgICBwYXJhbVN0cjogeyBjaGlsZEludElkOiAwIH0sXHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbigoeG1sT2JqZWN0KSA9PiB7XHJcbiAgICAgICAgICBpZih0eXBlb2YoeG1sT2JqZWN0WydTdHVkZW50RG9jdW1lbnRzJ11bMF0uU3R1ZGVudERvY3VtZW50RGF0YXNbMF0pPT1cInN0cmluZ1wiKXtjb25zb2xlLmxvZyhcIndoZXJlIGlzIG15IG1pbmRcIik7cmV0dXJuIHJlcyhbW10sXHJcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgeG1sT2JqZWN0LmV4dHJhRGF0YV0pfVxyXG4gICAgICAgICAgZWxzZXtcclxuICAgICAgICAgIHJlcyhbXHJcbiAgICAgICAgICAgIHhtbE9iamVjdFsnU3R1ZGVudERvY3VtZW50cyddWzBdLlN0dWRlbnREb2N1bWVudERhdGFzWzBdLlN0dWRlbnREb2N1bWVudERhdGEubWFwKFxyXG4gICAgICAgICAgICAgICh4bWw6IGFueSkgPT4gbmV3IERvY3VtZW50KHhtbCwgc3VwZXIuY3JlZGVudGlhbHMpXHJcbiAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgIC8vQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICB4bWxPYmplY3QuZXh0cmFEYXRhXVxyXG4gICAgICAgICAgKTt9XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2gocmVqKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyBhIGxpc3Qgb2YgcmVwb3J0IGNhcmRzXHJcbiAgICogQHJldHVybnMge1Byb21pc2U8UmVwb3J0Q2FyZFtdPn0gUmV0dXJucyBhIGxpc3Qgb2YgcmVwb3J0IGNhcmRzIHRoYXQgY2FuIGZldGNoIGEgZmlsZVxyXG4gICAqIEBkZXNjcmlwdGlvblxyXG4gICAqIGBgYGpzXHJcbiAgICogY29uc3QgcmVwb3J0Q2FyZHMgPSBhd2FpdCBjbGllbnQucmVwb3J0Q2FyZHMoKTtcclxuICAgKiBjb25zdCBmaWxlcyA9IGF3YWl0IFByb21pc2UuYWxsKHJlcG9ydENhcmRzLm1hcCgoY2FyZCkgPT4gY2FyZC5nZXQoKSkpO1xyXG4gICAqIGNvbnN0IGJhc2U2NGFyciA9IGZpbGVzLm1hcCgoZmlsZSkgPT4gZmlsZS5iYXNlNjQpOyAvLyBbXCJKVkJFUmkwLi4uXCIsIFwiZFVJb2ExLi4uXCIsIC4uLl07XHJcbiAgICogYGBgXHJcbiAgICovXHJcbiAgcHVibGljIHJlcG9ydENhcmRzKCk6IFByb21pc2U8W1JlcG9ydENhcmRbXSxhbnldPiB7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlcywgcmVqKSA9PiB7XHJcbiAgICAgIHN1cGVyXHJcbiAgICAgICAgLnByb2Nlc3NSZXF1ZXN0PFJlcG9ydENhcmRzWE1MT2JqZWN0Pih7XHJcbiAgICAgICAgICBtZXRob2ROYW1lOiAnR2V0UmVwb3J0Q2FyZEluaXRpYWxEYXRhJyxcclxuICAgICAgICAgIHBhcmFtU3RyOiB7IGNoaWxkSW50SWQ6IDAgfSxcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKCh4bWxPYmplY3QpID0+IHtcclxuICAgICAgICAgIHJlcyhbXHJcbiAgICAgICAgICAgIHhtbE9iamVjdC5SQ1JlcG9ydGluZ1BlcmlvZERhdGFbMF0uUkNSZXBvcnRpbmdQZXJpb2RzWzBdLlJDUmVwb3J0aW5nUGVyaW9kLm1hcChcclxuICAgICAgICAgICAgICAoeG1sKSA9PiBuZXcgUmVwb3J0Q2FyZCh4bWwsIHN1cGVyLmNyZWRlbnRpYWxzKVxyXG4gICAgICAgICAgICAgIC8vQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICApLHhtbE9iamVjdC5leHRyYURhdGFdXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKHJlaik7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIHN0dWRlbnQncyBzY2hvb2wncyBpbmZvcm1hdGlvblxyXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPFNjaG9vbEluZm8+fSBSZXR1cm5zIHRoZSBpbmZvcm1hdGlvbiBvZiB0aGUgc3R1ZGVudCdzIHNjaG9vbFxyXG4gICAqIEBkZXNjcmlwdGlvblxyXG4gICAqIGBgYGpzXHJcbiAgICogYXdhaXQgY2xpZW50LnNjaG9vbEluZm8oKTtcclxuICAgKlxyXG4gICAqIGNsaWVudC5zY2hvb2xJbmZvKCkudGhlbigoc2Nob29sSW5mbykgPT4ge1xyXG4gICAqICBjb25zb2xlLmxvZyhfLnVuaXEoc2Nob29sSW5mby5zdGFmZi5tYXAoKHN0YWZmKSA9PiBzdGFmZi5uYW1lKSkpOyAvLyBMaXN0IGFsbCBzdGFmZiBwb3NpdGlvbnMgdXNpbmcgbG9kYXNoXHJcbiAgICogfSlcclxuICAgKiBgYGBcclxuICAgKi9cclxuICBwdWJsaWMgc2Nob29sSW5mbygpOiBQcm9taXNlPFtTY2hvb2xJbmZvLGFueV0+IHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IHtcclxuICAgICAgc3VwZXJcclxuICAgICAgICAucHJvY2Vzc1JlcXVlc3Q8U2Nob29sSW5mb1hNTE9iamVjdCZ7ZXh0cmFEYXRhPzphbnl9Pih7XHJcbiAgICAgICAgICBtZXRob2ROYW1lOiAnU3R1ZGVudFNjaG9vbEluZm8nLFxyXG4gICAgICAgICAgcGFyYW1TdHI6IHsgY2hpbGRJbnRJRDogMCB9LFxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oKHJlc3VsdCkgPT4ge1xyXG4gICAgICAgICAgY29uc3QgeG1sT2JqZWN0PXJlc3VsdC5TdHVkZW50U2Nob29sSW5mb0xpc3RpbmdbMF07XHJcbiAgICAgICAgICAvL0B0cy1pZ25vcmVcclxuICAgICAgICAgIHhtbE9iamVjdC5leHRyYURhdGE9cmVzdWx0LmV4dHJhRGF0YTtcclxuICAgICAgICAgIHJlcyhbe1xyXG4gICAgICAgICAgICBzY2hvb2w6IHtcclxuICAgICAgICAgICAgICBhZGRyZXNzOiB4bWxPYmplY3RbJ0BfU2Nob29sQWRkcmVzcyddWzBdLFxyXG4gICAgICAgICAgICAgIGFkZHJlc3NBbHQ6IHhtbE9iamVjdFsnQF9TY2hvb2xBZGRyZXNzMiddWzBdLFxyXG4gICAgICAgICAgICAgIGNpdHk6IHhtbE9iamVjdFsnQF9TY2hvb2xDaXR5J11bMF0sXHJcbiAgICAgICAgICAgICAgemlwQ29kZTogeG1sT2JqZWN0WydAX1NjaG9vbFppcCddWzBdLFxyXG4gICAgICAgICAgICAgIHBob25lOiB4bWxPYmplY3RbJ0BfUGhvbmUnXVswXSxcclxuICAgICAgICAgICAgICBhbHRQaG9uZTogeG1sT2JqZWN0WydAX1Bob25lMiddWzBdLFxyXG4gICAgICAgICAgICAgIHByaW5jaXBhbDoge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogeG1sT2JqZWN0WydAX1ByaW5jaXBhbCddWzBdLFxyXG4gICAgICAgICAgICAgICAgZW1haWw6IHhtbE9iamVjdFsnQF9QcmluY2lwYWxFbWFpbCddWzBdLFxyXG4gICAgICAgICAgICAgICAgc3RhZmZHdTogeG1sT2JqZWN0WydAX1ByaW5jaXBhbEd1J11bMF0sXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc3RhZmY6IHhtbE9iamVjdC5TdGFmZkxpc3RzWzBdLlN0YWZmTGlzdC5tYXAoKHN0YWZmKSA9PiAoe1xyXG4gICAgICAgICAgICAgIG5hbWU6IHN0YWZmWydAX05hbWUnXVswXSxcclxuICAgICAgICAgICAgICBlbWFpbDogc3RhZmZbJ0BfRU1haWwnXVswXSxcclxuICAgICAgICAgICAgICBzdGFmZkd1OiBzdGFmZlsnQF9TdGFmZkdVJ11bMF0sXHJcbiAgICAgICAgICAgICAgam9iVGl0bGU6IHN0YWZmWydAX1RpdGxlJ11bMF0sXHJcbiAgICAgICAgICAgICAgZXh0bjogc3RhZmZbJ0BfRXh0biddWzBdLFxyXG4gICAgICAgICAgICAgIHBob25lOiBzdGFmZlsnQF9QaG9uZSddWzBdLFxyXG4gICAgICAgICAgICB9KSksXHJcbiAgICAgICAgICAgIC8vQHRzLWlnbm9yZVxyXG4gICAgICAgICAgfSx4bWxPYmplY3QuZXh0cmFEYXRhXSk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2gocmVqKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgc2NoZWR1bGUgb2YgdGhlIHN0dWRlbnRcclxuICAgKiBAcGFyYW0ge251bWJlcn0gdGVybUluZGV4IFRoZSBpbmRleCBvZiB0aGUgdGVybS5cclxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxTY2hlZHVsZT59IFJldHVybnMgdGhlIHNjaGVkdWxlIG9mIHRoZSBzdHVkZW50XHJcbiAgICogQGRlc2NyaXB0aW9uXHJcbiAgICogYGBganNcclxuICAgKiBhd2FpdCBzY2hlZHVsZSgwKSAvLyAtPiB7IHRlcm06IHsgaW5kZXg6IDAsIG5hbWU6ICcxc3QgUXRyIFByb2dyZXNzJyB9LCAuLi4gfVxyXG4gICAqIGBgYFxyXG4gICAqL1xyXG4gIHB1YmxpYyBzY2hlZHVsZSh0ZXJtSW5kZXg/OiBudW1iZXIpOiBQcm9taXNlPFthbnksYW55XT4ge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXMsIHJlaikgPT4ge1xyXG4gICAgICBzdXBlclxyXG4gICAgICAgIC5wcm9jZXNzUmVxdWVzdDxhbnk+KHtcclxuICAgICAgICAgIG1ldGhvZE5hbWU6ICdTdHVkZW50Q2xhc3NMaXN0JyxcclxuICAgICAgICAgIHBhcmFtU3RyOiB7IGNoaWxkSW50SWQ6IDAsIC4uLih0ZXJtSW5kZXggIT0gbnVsbCA/IHsgVGVybUluZGV4OiB0ZXJtSW5kZXggfSA6IHt9KSB9LFxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oKHhtbE9iamVjdDphbnkpID0+IHtcclxuICAgICAgICAgIHZhciByZXNwb25zZTphbnk9e31cclxuICAgICAgICAgIHJlc3BvbnNlLnRlcm1OYW1lPXhtbE9iamVjdC5TdHVkZW50Q2xhc3NTY2hlZHVsZVswXVsnQF9UZXJtSW5kZXhOYW1lJ11bMF07IC8vY291bGQgc29tZXRpbWVzIGJlIHN0cmluZ3MgYnV0IGZ1Y2sgdGhhdFxyXG4gICAgICAgICAgcmVzcG9uc2UudGVybUluZGV4PXhtbE9iamVjdC5TdHVkZW50Q2xhc3NTY2hlZHVsZVswXVsnQF9UZXJtSW5kZXgnXVswXTtcclxuICAgICAgICAgIC8vZm9yIG5vdyB3ZSdyZSBub3QgZ3JhYmJpbmcgdGhlIHRlcm1zIGZvciB0aGUgY29uY2N1cmVudCBzY2hvb2wsIHRoZXkgbG93ayBkb24ndCBtYXR0ZXJcclxuICAgICAgICAgIHJlc3BvbnNlLnRlcm1zPXhtbE9iamVjdC5TdHVkZW50Q2xhc3NTY2hlZHVsZVswXS5UZXJtTGlzdHNbMF0uVGVybUxpc3RpbmcubWFwKCh0ZXJtOmFueSk9Pih7c3RhcnQ6dGVybVsnQF9CZWdpbkRhdGUnXVswXSxlbmQ6dGVybVsnQF9FbmREYXRlJ11bMF0sdGVybUluZGV4OnRlcm1bJ0BfVGVybUluZGV4J11bMF0sdGVybU5hbWU6dGVybVsnQF9UZXJtTmFtZSddWzBdfSkpXHJcbiAgICAgICAgICBcclxuICAgICAgICAgIHJlc3BvbnNlLm1haW5DbGFzc2VzPXhtbE9iamVjdC5TdHVkZW50Q2xhc3NTY2hlZHVsZVswXS5DbGFzc0xpc3RzWzBdLkNsYXNzTGlzdGluZy5tYXAoKGNvdXJzZTphbnkpPT4oe25hbWU6Y291cnNlWydAX0NvdXJzZVRpdGxlJ11bMF0scGVyaW9kOmNvdXJzZVsnQF9QZXJpb2QnXVswXSx0ZWFjaGVyOmNvdXJzZVsnQF9UZWFjaGVyJ11bMF0scm9vbTpjb3Vyc2VbJ0BfUm9vbU5hbWUnXVswXX0pKVxyXG4gICAgICAgICAgdmFyIGNoZWNrZXI9ZmFsc2U7XHJcbiAgICAgICAgICB0cnl7XHJcbiAgICAgICAgICAgIGNoZWNrZXI9eG1sT2JqZWN0LlN0dWRlbnRDbGFzc1NjaGVkdWxlWzBdLkNvbmN1cnJlbnRTY2hvb2xTdHVkZW50Q2xhc3NTY2hlZHVsZXNbMF0uQ29uY3VycmVudFNjaG9vbFN0dWRlbnRDbGFzc1NjaGVkdWxlWzBdLlxyXG4gICAgICAgICAgICBDb25TY2hDbGFzc0xpc3RzWzBdLkNsYXNzTGlzdGluZ1swXSE9JydcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICB9Y2F0Y2h7fVxyXG5cclxuICAgICAgICAgIFxyXG4gICAgICAgICAgaWYoY2hlY2tlcil7XHJcbiAgICAgICAgICAgIHJlc3BvbnNlLmNvbkNsYXNzZXM9eG1sT2JqZWN0LlN0dWRlbnRDbGFzc1NjaGVkdWxlWzBdLkNvbmN1cnJlbnRTY2hvb2xTdHVkZW50Q2xhc3NTY2hlZHVsZXNbMF0uQ29uY3VycmVudFNjaG9vbFN0dWRlbnRDbGFzc1NjaGVkdWxlWzBdLkNvblNjaENsYXNzTGlzdHNbMF0uQ2xhc3NMaXN0aW5nLm1hcCgoY291cnNlOmFueSk9Pih7bmFtZTpjb3Vyc2VbJ0BfQ291cnNlVGl0bGUnXVswXSxwZXJpb2Q6Y291cnNlWydAX1BlcmlvZCddWzBdLHRlYWNoZXI6Y291cnNlWydAX1RlYWNoZXInXVswXSxyb29tOmNvdXJzZVsnQF9Sb29tTmFtZSddWzBdfSkpXHJcbiAgICAgICAgICAgIHJlc3BvbnNlLmNvbkNsYXNzZXMuY29uTmFtZT14bWxPYmplY3QuU3R1ZGVudENsYXNzU2NoZWR1bGVbMF0uQ29uY3VycmVudFNjaG9vbFN0dWRlbnRDbGFzc1NjaGVkdWxlc1swXS5Db25jdXJyZW50U2Nob29sU3R1ZGVudENsYXNzU2NoZWR1bGVbMF1bJ0BfU2Nob29sTmFtZSddXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0cnl7XHJcbiAgICAgICAgICBpZih4bWxPYmplY3QuU3R1ZGVudENsYXNzU2NoZWR1bGVbMF0uVG9kYXlTY2hlZHVsZUluZm9EYXRhWzBdLlNjaG9vbEluZm9zWzBdIT0nJyl7XHJcbiAgICAgICAgICAgIHJlc3BvbnNlLnRvZGF5PXt9XHJcbiAgICAgICAgICAgIHJlc3BvbnNlLnRvZGF5Lm1haW49eG1sT2JqZWN0LlN0dWRlbnRDbGFzc1NjaGVkdWxlWzBdLlRvZGF5U2NoZWR1bGVJbmZvRGF0YVswXS5TY2hvb2xJbmZvc1swXS5TY2hvb2xJbmZvWzBdLkNsYXNzZXNbMF0uQ2xhc3NJbmZvLm1hcCgoY291cnNlOmFueSk9Pih7bmFtZTpjb3Vyc2VbJ0BfQ2xhc3NOYW1lJ10sc3RhcnQ6Y291cnNlWydAX1N0YXJ0VGltZSddLGVuZDpjb3Vyc2VbJ0BfRW5kVGltZSddLHRlYWNoZXI6Y291cnNlWydAX1RlYWNoZXJOYW1lJ10scGVyaW9kOmNvdXJzZVsnQF9QZXJpb2QnXSxyb29tOmNvdXJzZVsnQF9Sb29tTmFtZSddfSkpXHJcbiAgICAgICAgICAgIHRyeXtcclxuICAgICAgICAgICAgICByZXNwb25zZS50b2RheS5jb249eG1sT2JqZWN0LlN0dWRlbnRDbGFzc1NjaGVkdWxlWzBdLlRvZGF5U2NoZWR1bGVJbmZvRGF0YVswXS5TY2hvb2xJbmZvc1swXS5TY2hvb2xJbmZvWzFdLkNsYXNzZXNbMF0uQ2xhc3NJbmZvLm1hcCgoY291cnNlOmFueSk9Pih7bmFtZTpjb3Vyc2VbJ0BfQ2xhc3NOYW1lJ10sc3RhcnQ6Y291cnNlWydAX1N0YXJ0VGltZSddLGVuZDpjb3Vyc2VbJ0BfRW5kVGltZSddLHRlYWNoZXI6Y291cnNlWydAX1RlYWNoZXJOYW1lJ10scGVyaW9kOmNvdXJzZVsnQF9QZXJpb2QnXSxyb29tOmNvdXJzZVsnQF9Sb29tTmFtZSddfSkpXHJcbiAgICAgICAgICAgICAgcmVzcG9uc2UudG9kYXkuY29uTmFtZT14bWxPYmplY3QuU3R1ZGVudENsYXNzU2NoZWR1bGVbMF0uVG9kYXlTY2hlZHVsZUluZm9EYXRhWzBdLlNjaG9vbEluZm9zWzBdLlNjaG9vbGluZm9bMV1bJ0BfU2Nob29sTmFtZSddO1xyXG4gICAgICAgICAgICB9Y2F0Y2h7Y29uc29sZS5sb2coXCJubyBjb25jdXJyZW50XCIpfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgcmVzcG9uc2UudG9kYXk9ZmFsc2VcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBcclxuICAgICAgICAgIH1jYXRjaChlcnJvcil7Y29uc29sZS5sb2coZXJyb3IpO3Jlc3BvbnNlLnRvZGF5PWZhbHNlfVxyXG4gICAgICAgICAgcmVzKFtyZXNwb25zZSx4bWxPYmplY3QuZXh0cmFEYXRhXSlcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvL0B0cy1pZ25vcmVcclxuXHJcbiAgICAgICAgKVxyXG4gICAgICAgIC5jYXRjaChyZWopO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBhdHRlbmRhbmNlIG9mIHRoZSBzdHVkZW50XHJcbiAgICogQHJldHVybnMge1Byb21pc2U8QXR0ZW5kYW5jZT59IFJldHVybnMgYW4gQXR0ZW5kYW5jZSBvYmplY3RcclxuICAgKiBAZGVzY3JpcHRpb25cclxuICAgKiBgYGBqc1xyXG4gICAqIGNsaWVudC5hdHRlbmRhbmNlKClcclxuICAgKiAgLnRoZW4oY29uc29sZS5sb2cpOyAvLyAtPiB7IHR5cGU6ICdQZXJpb2QnLCBwZXJpb2Q6IHsuLi59LCBzY2hvb2xOYW1lOiAnVW5pdmVyc2l0eSBIaWdoIFNjaG9vbCcsIGFic2VuY2VzOiBbLi4uXSwgcGVyaW9kSW5mb3M6IFsuLi5dIH1cclxuICAgKiBgYGBcclxuICAgKi9cclxuICBwdWJsaWMgYXR0ZW5kYW5jZSgpOiBQcm9taXNlPFtBdHRlbmRhbmNlLGFueV0+IHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IHtcclxuICAgICAgc3VwZXJcclxuICAgICAgICAucHJvY2Vzc1JlcXVlc3Q8QXR0ZW5kYW5jZVhNTE9iamVjdD4oe1xyXG4gICAgICAgICAgbWV0aG9kTmFtZTogJ0F0dGVuZGFuY2UnLFxyXG4gICAgICAgICAgcGFyYW1TdHI6IHtcclxuICAgICAgICAgICAgY2hpbGRJbnRJZDogMCxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbigoYXR0ZW5kYW5jZVhNTE9iamVjdCkgPT4ge1xyXG4gICAgICAgICAgY29uc3QgeG1sT2JqZWN0ID0gYXR0ZW5kYW5jZVhNTE9iamVjdC5BdHRlbmRhbmNlWzBdO1xyXG4gICAgICAgICAgLy9AdHMtaWdub3JlXHJcbiAgICAgICAgICB4bWxPYmplY3QuZXh0cmFEYXRhPWF0dGVuZGFuY2VYTUxPYmplY3QuZXh0cmFEYXRhXHJcblxyXG4gICAgICAgICAgcmVzKFt7XHJcbiAgICAgICAgICAgIHR5cGU6IHhtbE9iamVjdFsnQF9UeXBlJ11bMF0sXHJcbiAgICAgICAgICAgIHBlcmlvZDoge1xyXG4gICAgICAgICAgICAgIHRvdGFsOiBOdW1iZXIoeG1sT2JqZWN0WydAX1BlcmlvZENvdW50J11bMF0pLFxyXG4gICAgICAgICAgICAgIHN0YXJ0OiBOdW1iZXIoeG1sT2JqZWN0WydAX1N0YXJ0UGVyaW9kJ11bMF0pLFxyXG4gICAgICAgICAgICAgIGVuZDogTnVtYmVyKHhtbE9iamVjdFsnQF9FbmRQZXJpb2QnXVswXSksXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNjaG9vbE5hbWU6IHhtbE9iamVjdFsnQF9TY2hvb2xOYW1lJ11bMF0sXHJcbiAgICAgICAgICAgIGFic2VuY2VzOiB4bWxPYmplY3QuQWJzZW5jZXNbMF0uQWJzZW5jZVxyXG4gICAgICAgICAgICAgID8geG1sT2JqZWN0LkFic2VuY2VzWzBdLkFic2VuY2UubWFwKChhYnNlbmNlKSA9PiAoe1xyXG4gICAgICAgICAgICAgICAgICBkYXRlOiBuZXcgRGF0ZShhYnNlbmNlWydAX0Fic2VuY2VEYXRlJ11bMF0pLFxyXG4gICAgICAgICAgICAgICAgICByZWFzb246IGFic2VuY2VbJ0BfUmVhc29uJ11bMF0sXHJcbiAgICAgICAgICAgICAgICAgIG5vdGU6IGFic2VuY2VbJ0BfTm90ZSddWzBdLFxyXG4gICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogYWJzZW5jZVsnQF9Db2RlQWxsRGF5RGVzY3JpcHRpb24nXVswXSxcclxuICAgICAgICAgICAgICAgICAgcGVyaW9kczogYWJzZW5jZS5QZXJpb2RzWzBdLlBlcmlvZC5tYXAoXHJcbiAgICAgICAgICAgICAgICAgICAgKHBlcmlvZCkgPT5cclxuICAgICAgICAgICAgICAgICAgICAgICh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlcmlvZDogTnVtYmVyKHBlcmlvZFsnQF9OdW1iZXInXVswXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHBlcmlvZFsnQF9OYW1lJ11bMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYXNvbjogcGVyaW9kWydAX1JlYXNvbiddWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3Vyc2U6IHBlcmlvZFsnQF9Db3Vyc2UnXVswXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhZmY6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBwZXJpb2RbJ0BfU3RhZmYnXVswXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFmZkd1OiBwZXJpb2RbJ0BfU3RhZmZHVSddWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGVtYWlsOiBwZXJpb2RbJ0BfU3RhZmZFTWFpbCddWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvcmdZZWFyR3U6IHBlcmlvZFsnQF9PcmdZZWFyR1UnXVswXSxcclxuICAgICAgICAgICAgICAgICAgICAgIH0gYXMgQWJzZW50UGVyaW9kKVxyXG4gICAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgICAgfSkpXHJcbiAgICAgICAgICAgICAgOiBbXSxcclxuICAgICAgICAgICAgcGVyaW9kSW5mb3M6IHhtbE9iamVjdC5Ub3RhbEFjdGl2aXRpZXNbMF0uUGVyaW9kVG90YWwubWFwKChwZCwgaSkgPT4gKHtcclxuICAgICAgICAgICAgICBwZXJpb2Q6IE51bWJlcihwZFsnQF9OdW1iZXInXVswXSksXHJcbiAgICAgICAgICAgICAgdG90YWw6IHtcclxuICAgICAgICAgICAgICAgIGV4Y3VzZWQ6IE51bWJlcih4bWxPYmplY3QuVG90YWxFeGN1c2VkWzBdLlBlcmlvZFRvdGFsW2ldWydAX1RvdGFsJ11bMF0pLFxyXG4gICAgICAgICAgICAgICAgdGFyZGllczogTnVtYmVyKHhtbE9iamVjdC5Ub3RhbFRhcmRpZXNbMF0uUGVyaW9kVG90YWxbaV1bJ0BfVG90YWwnXVswXSksXHJcbiAgICAgICAgICAgICAgICB1bmV4Y3VzZWQ6IE51bWJlcih4bWxPYmplY3QuVG90YWxVbmV4Y3VzZWRbMF0uUGVyaW9kVG90YWxbaV1bJ0BfVG90YWwnXVswXSksXHJcbiAgICAgICAgICAgICAgICBhY3Rpdml0aWVzOiBOdW1iZXIoeG1sT2JqZWN0LlRvdGFsQWN0aXZpdGllc1swXS5QZXJpb2RUb3RhbFtpXVsnQF9Ub3RhbCddWzBdKSxcclxuICAgICAgICAgICAgICAgIHVuZXhjdXNlZFRhcmRpZXM6IE51bWJlcih4bWxPYmplY3QuVG90YWxVbmV4Y3VzZWRUYXJkaWVzWzBdLlBlcmlvZFRvdGFsW2ldWydAX1RvdGFsJ11bMF0pLFxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0pKSBhcyBQZXJpb2RJbmZvW10sXHJcbiAgICAgICAgICB9IGFzIEF0dGVuZGFuY2UsXHJcbiAgICAgICAgICAvL0B0cy1pZ25vcmVcclxuICAgICAgICB4bWxPYmplY3QuZXh0cmFEYXRhXVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2gocmVqKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgZ3JhZGVib29rIG9mIHRoZSBzdHVkZW50XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJlcG9ydGluZ1BlcmlvZEluZGV4IFRoZSB0aW1lZnJhbWUgdGhhdCB0aGUgZ3JhZGVib29rIHNob3VsZCByZXR1cm5cclxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxHcmFkZWJvb2s+fSBSZXR1cm5zIGEgR3JhZGVib29rIG9iamVjdFxyXG4gICAqIEBkZXNjcmlwdGlvblxyXG4gICAqIGBgYGpzXHJcbiAgICogY29uc3QgZ3JhZGVib29rID0gYXdhaXQgY2xpZW50LmdyYWRlYm9vaygpO1xyXG4gICAqIGNvbnNvbGUubG9nKGdyYWRlYm9vayk7IC8vIHsgZXJyb3I6ICcnLCB0eXBlOiAnVHJhZGl0aW9uYWwnLCByZXBvcnRpbmdQZXJpb2Q6IHsuLi59LCBjb3Vyc2VzOiBbLi4uXSB9O1xyXG4gICAqXHJcbiAgICogYXdhaXQgY2xpZW50LmdyYWRlYm9vaygwKSAvLyBTb21lIHNjaG9vbHMgd2lsbCBoYXZlIFJlcG9ydGluZ1BlcmlvZEluZGV4IDAgYXMgXCIxc3QgUXVhcnRlciBQcm9ncmVzc1wiXHJcbiAgICogYXdhaXQgY2xpZW50LmdyYWRlYm9vayg3KSAvLyBTb21lIHNjaG9vbHMgd2lsbCBoYXZlIFJlcG9ydGluZ1BlcmlvZEluZGV4IDcgYXMgXCI0dGggUXVhcnRlclwiXHJcbiAgICogYGBgXHJcbiAgICovXHJcblxyXG5cclxuXHJcbiAgcHVibGljIGdyYWRlYm9vaz1PYmplY3QuYXNzaWduKChyZXBvcnRpbmdQZXJpb2RJbmRleD86IG51bWJlcixvcmdZZWFyR3U/OnN0cmluZyk9PntcclxuICAgICAgICBzdXBlclxyXG4gICAgICAgIC5wcm9jZXNzUmVxdWVzdDxTdHJpbmc+KFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBtZXRob2ROYW1lOiAnR3JhZGVib29rJyxcclxuICAgICAgICAgICAgcGFyYW1TdHI6IHtcclxuICAgICAgICAgICAgICBjaGlsZEludElkOiAwLFxyXG4gICAgICAgICAgICAgIC4uLihyZXBvcnRpbmdQZXJpb2RJbmRleCAhPSBudWxsID8geyBSZXBvcnRQZXJpb2Q6IHJlcG9ydGluZ1BlcmlvZEluZGV4IH0gOiB7fSksXHJcbiAgICAgICAgICAgICAgLi4uKG9yZ1llYXJHdSAhPSBudWxsID8geyBDb25jdXJyZW50U2NoT3JnWWVhckdVOiBvcmdZZWFyR3UgfSA6IHt9KVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICApXHJcbiAgICAgICAgLnRoZW4oKHJhd1htbDpTdHJpbmcpID0+IHtcclxuICAgICAgICAgIHJldHVybiAocmF3WG1sKVxyXG4gICAgICAgIH0pXHJcbiAgfSx7cHJlcGFyc2UoeG1sOnN0cmluZyl7IFxyXG4gICAgICAgICByZXR1cm4gbmV3IFhNTEZhY3RvcnkoeG1sKVxyXG4gICAgICAgICAgICAgIC5lbmNvZGVBdHRyaWJ1dGUoJ01lYXN1cmVEZXNjcmlwdGlvbicsICdIYXNEcm9wQm94JylcclxuICAgICAgICAgICAgICAuZW5jb2RlQXR0cmlidXRlKCdNZWFzdXJlJywgJ1R5cGUnKVxyXG4gICAgICAgICAgICAgIC50b1N0cmluZygpfSxwYXJzZSh4bWw6c3RyaW5nLHJlcG9ydGluZ1BlcmlvZEluZGV4Om51bWJlcil7IFxyXG4gICAgICAgICAgY29uc3QgeG1sT2JqZWN0OkdyYWRlYm9va1hNTE9iamVjdCA9IHN1cGVyLnBhcnNlUmVzcG9uc2UoeG1sLHRoaXMucHJlcGFyc2UpO1xyXG5cclxuICAgIHRyeXtcclxuXHJcblxyXG4gICAgICAgICAgLy9AdHMtaWdub3JlXHJcbiAgICAgICAgaWYgKHhtbE9iamVjdC5SVF9FUlJPUlswXVsnQF9FUlJPUl9NRVNTQUdFJ11bMF0uaW5jbHVkZXMoXCJUaGUgdXNlciBuYW1lIG9yIHBhc3N3b3JkIGlzIGluY29ycmVjdFwiKXx8eG1sT2JqZWN0LlJUX0VSUk9SWzBdWydAX0VSUk9SX01FU1NBR0UnXVswXS5pbmNsdWRlcyhcIkludmFsaWQgdXNlciBpZCBvciBwYXNzd29yZFwiKSkge3JldHVybihuZXcgRXJyb3IoXCJJbnZhbGlkL0luY29ycmVjdCBVc2VybmFtZSBvciBQYXNzd29yZFwiKSk7fVxyXG4gICAgICAgICAgICAgICAgLy9AdHMtaWdub3JlXHJcbiAgICAgICAgZWxzZXtyZXR1cm4gKG5ldyBSZXF1ZXN0RXhjZXB0aW9uKHhtbE9iamVjdCkpfTtcclxuICAgICAgICAgICAgXHJcbiAgICB9XHJcbiAgICBjYXRjaChlKXt9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgY29uc3QgcmVzcG9uc2U6R3JhZGVib29rfGFueT17XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJlc3BvbnNlLnR5cGU9eG1sT2JqZWN0LkdyYWRlYm9va1swXVsnQF9UeXBlJ11bMF1cclxuICAgICAgICAgICAgcmVzcG9uc2UucmVwb3J0aW5nUGVyaW9kPXtcclxuICAgICAgICAgICAgICBjdXJyZW50OiB7XHJcbiAgICAgICAgICAgICAgICBpbmRleDpcclxuICAgICAgICAgICAgICAgICAgcmVwb3J0aW5nUGVyaW9kSW5kZXggPz9cclxuICAgICAgICAgICAgICAgICAgTnVtYmVyKFxyXG4gICAgICAgICAgICAgICAgICAgIHhtbE9iamVjdC5HcmFkZWJvb2tbMF0uUmVwb3J0aW5nUGVyaW9kc1swXS5SZXBvcnRQZXJpb2QuZmluZChcclxuICAgICAgICAgICAgICAgICAgICAgICh4OmFueSkgPT4geFsnQF9HcmFkZVBlcmlvZCddWzBdID09PSB4bWxPYmplY3QuR3JhZGVib29rWzBdLlJlcG9ydGluZ1BlcmlvZFswXVsnQF9HcmFkZVBlcmlvZCddWzBdXHJcbiAgICAgICAgICAgICAgICAgICAgKT8uWydAX0luZGV4J11bMF1cclxuICAgICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgIGRhdGU6IHtcclxuICAgICAgICAgICAgICAgICAgc3RhcnQ6IG5ldyBEYXRlKHhtbE9iamVjdC5HcmFkZWJvb2tbMF0uUmVwb3J0aW5nUGVyaW9kWzBdWydAX1N0YXJ0RGF0ZSddWzBdKSxcclxuICAgICAgICAgICAgICAgICAgZW5kOiBuZXcgRGF0ZSh4bWxPYmplY3QuR3JhZGVib29rWzBdLlJlcG9ydGluZ1BlcmlvZFswXVsnQF9FbmREYXRlJ11bMF0pLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG5hbWU6IHhtbE9iamVjdC5HcmFkZWJvb2tbMF0uUmVwb3J0aW5nUGVyaW9kWzBdWydAX0dyYWRlUGVyaW9kJ11bMF0sXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBhdmFpbGFibGU6IHhtbE9iamVjdC5HcmFkZWJvb2tbMF0uUmVwb3J0aW5nUGVyaW9kc1swXS5SZXBvcnRQZXJpb2QubWFwKChwZXJpb2Q6YW55KSA9PiAoe1xyXG4gICAgICAgICAgICAgICAgZGF0ZTogeyBzdGFydDogbmV3IERhdGUocGVyaW9kWydAX1N0YXJ0RGF0ZSddWzBdKSwgZW5kOiBuZXcgRGF0ZShwZXJpb2RbJ0BfRW5kRGF0ZSddWzBdKSB9LFxyXG4gICAgICAgICAgICAgICAgbmFtZTogcGVyaW9kWydAX0dyYWRlUGVyaW9kJ11bMF0sXHJcbiAgICAgICAgICAgICAgICBpbmRleDogTnVtYmVyKHBlcmlvZFsnQF9JbmRleCddWzBdKSxcclxuICAgICAgICAgICAgICB9KSksXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlc3BvbnNlLmNvdXJzZXM9IHhtbE9iamVjdC5HcmFkZWJvb2tbMF0uQ291cnNlc1swXS5Db3Vyc2UubWFwKChjb3Vyc2U6YW55KSA9PiAoe1xyXG4gICAgICAgICAgICAgIHBlcmlvZDogTnVtYmVyKGNvdXJzZVsnQF9QZXJpb2QnXVswXSksXHJcbiAgICAgICAgICAgICAgdGl0bGU6IGhlLmRlY29kZShjb3Vyc2VbJ0BfVGl0bGUnXVswXSksXHJcbiAgICAgICAgICAgICAgcm9vbTogY291cnNlWydAX1Jvb20nXVswXSxcclxuICAgICAgICAgICAgICBzdGFmZjoge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogY291cnNlWydAX1N0YWZmJ11bMF0sXHJcbiAgICAgICAgICAgICAgICBlbWFpbDogY291cnNlWydAX1N0YWZmRU1haWwnXVswXSxcclxuICAgICAgICAgICAgICAgIHN0YWZmR3U6IGNvdXJzZVsnQF9TdGFmZkdVJ11bMF0sXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBtYXJrczogdHlwZW9mKGNvdXJzZS5NYXJrc1swXSkhPT0nc3RyaW5nJyA/IChjb3Vyc2UuTWFya3NbMF0uTWFyay5tYXAoKG1hcms6YW55KSA9PiAoe1xyXG4gICAgICAgICAgICAgICAgbmFtZTogbWFya1snQF9NYXJrTmFtZSddWzBdLFxyXG4gICAgICAgICAgICAgICAgY2FsY3VsYXRlZFNjb3JlOiB7XHJcbiAgICAgICAgICAgICAgICAgIHN0cmluZzogbWFya1snQF9DYWxjdWxhdGVkU2NvcmVTdHJpbmcnXVswXSxcclxuICAgICAgICAgICAgICAgICAgcmF3OiBOdW1iZXIobWFya1snQF9DYWxjdWxhdGVkU2NvcmVSYXcnXVswXSksXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgd2VpZ2h0ZWRDYXRlZ29yaWVzOlxyXG4gICAgICAgICAgICAgICAgICB0eXBlb2YgbWFya1snR3JhZGVDYWxjdWxhdGlvblN1bW1hcnknXVswXSAhPT0gJ3N0cmluZydcclxuICAgICAgICAgICAgICAgICAgICA/IG1hcmtbJ0dyYWRlQ2FsY3VsYXRpb25TdW1tYXJ5J11bMF0uQXNzaWdubWVudEdyYWRlQ2FsYy5tYXAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICh3ZWlnaHRlZDogeyBbeDogc3RyaW5nXTogYW55W107IH0pID0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IGhlLmRlY29kZSh3ZWlnaHRlZFsnQF9UeXBlJ11bMF0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsY3VsYXRlZE1hcms6IHdlaWdodGVkWydAX0NhbGN1bGF0ZWRNYXJrJ11bMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3ZWlnaHQ6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZhbHVhdGVkOiB3ZWlnaHRlZFsnQF9XZWlnaHRlZFBjdCddWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFuZGFyZDogd2VpZ2h0ZWRbJ0BfV2VpZ2h0J11bMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQ6IE51bWJlcih3ZWlnaHRlZFsnQF9Qb2ludHMnXVswXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3NpYmxlOiBOdW1iZXIod2VpZ2h0ZWRbJ0BfUG9pbnRzUG9zc2libGUnXVswXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0gYXMgV2VpZ2h0ZWRDYXRlZ29yeSlcclxuICAgICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICAgICA6IFtdLFxyXG4gICAgICAgICAgICAgICAgYXNzaWdubWVudHM6XHJcbiAgICAgICAgICAgICAgICAgIHR5cGVvZiBtYXJrLkFzc2lnbm1lbnRzWzBdICE9PSAnc3RyaW5nJ1xyXG4gICAgICAgICAgICAgICAgICAgID8gKG1hcmsuQXNzaWdubWVudHNbMF0uQXNzaWdubWVudC5tYXAoKGFzc2lnbm1lbnQ6YW55KSA9PiAoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBncmFkZWJvb2tJZDogYXNzaWdubWVudFsnQF9HcmFkZWJvb2tJRCddWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBkZWNvZGVVUkkoYXNzaWdubWVudFsnQF9NZWFzdXJlJ11bMF0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBoZS5kZWNvZGUoYXNzaWdubWVudFsnQF9UeXBlJ11bMF0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IG5ldyBEYXRlKGFzc2lnbm1lbnRbJ0BfRGF0ZSddWzBdKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBkdWU6IG5ldyBEYXRlKGFzc2lnbm1lbnRbJ0BfRHVlRGF0ZSddWzBdKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcmU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBoZS5kZWNvZGUoYXNzaWdubWVudFsnQF9TY29yZVR5cGUnXVswXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGFzc2lnbm1lbnRbJ0BfU2NvcmUnXSAhPT0gdW5kZWZpbmVkID8gYXNzaWdubWVudFsnQF9TY29yZSddIDogXCJOb3QgR3JhZGVkXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50czogYXNzaWdubWVudFsnQF9Qb2ludHMnXVswXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbm90ZXM6IGhlLmRlY29kZShhc3NpZ25tZW50WydAX05vdGVzJ11bMF0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZWFjaGVySWQ6IGFzc2lnbm1lbnRbJ0BfVGVhY2hlcklEJ11bMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBkZWNvZGVVUkkoYXNzaWdubWVudFsnQF9NZWFzdXJlRGVzY3JpcHRpb24nXVswXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhc0Ryb3Bib3g6IEpTT04ucGFyc2UoYXNzaWdubWVudFsnQF9IYXNEcm9wQm94J11bMF0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHVkZW50SWQ6IGFzc2lnbm1lbnRbJ0BfU3R1ZGVudElEJ11bMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyb3Bib3hEYXRlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IG5ldyBEYXRlKGFzc2lnbm1lbnRbJ0BfRHJvcFN0YXJ0RGF0ZSddWzBdKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBlbmQ6IG5ldyBEYXRlKGFzc2lnbm1lbnRbJ0BfRHJvcEVuZERhdGUnXVswXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc291cmNlczpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlb2YgYXNzaWdubWVudC5SZXNvdXJjZXNbMF0gIT09ICdzdHJpbmcnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IC8qKGFzc2lnbm1lbnQuUmVzb3VyY2VzWzBdLlJlc291cmNlLm1hcCgocnNyYzphbnkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHJzcmNbJ0BfVHlwZSddWzBdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdGaWxlJzoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlUnNyYyA9IHJzcmMgYXMgRmlsZVJlc291cmNlWE1MT2JqZWN0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFJlc291cmNlVHlwZS5GSUxFLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IGZpbGVSc3JjWydAX0ZpbGVUeXBlJ11bMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBmaWxlUnNyY1snQF9GaWxlTmFtZSddWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJpOiB0aGlzLmhvc3RVcmwgKyBmaWxlUnNyY1snQF9TZXJ2ZXJGaWxlTmFtZSddWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2U6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGU6IG5ldyBEYXRlKGZpbGVSc3JjWydAX1Jlc291cmNlRGF0ZSddWzBdKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBmaWxlUnNyY1snQF9SZXNvdXJjZUlEJ11bMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBmaWxlUnNyY1snQF9SZXNvdXJjZU5hbWUnXVswXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGFzIEZpbGVSZXNvdXJjZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ1VSTCc6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJsUnNyYyA9IHJzcmMgYXMgVVJMUmVzb3VyY2VYTUxPYmplY3Q7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiB1cmxSc3JjWydAX1VSTCddICE9PSB1bmRlZmluZWQgPyB1cmxSc3JjWydAX1VSTCddIDogXCJOb3QgR2l2ZW5cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBSZXNvdXJjZVR5cGUuVVJMLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc291cmNlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRlOiBuZXcgRGF0ZSh1cmxSc3JjWydAX1Jlc291cmNlRGF0ZSddWzBdKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB1cmxSc3JjWydAX1Jlc291cmNlSUQnXVswXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHVybFJzcmNbJ0BfUmVzb3VyY2VOYW1lJ11bMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogdXJsUnNyY1snQF9SZXNvdXJjZURlc2NyaXB0aW9uJ11bMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiB1cmxSc3JjWydAX1NlcnZlckZpbGVOYW1lJ11bMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gYXMgVVJMUmVzb3VyY2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWooXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYFR5cGUgJHtyc3JjWydAX1R5cGUnXVswXX0gZG9lcyBub3QgZXhpc3QgYXMgYSB0eXBlLiBBZGQgaXQgdG8gdHlwZSBkZWNsYXJhdGlvbnMuYFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkgYXMgKEZpbGVSZXNvdXJjZSB8IFVSTFJlc291cmNlKVtdKSAqL1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9PYnZpb3VzbHkgdGhpcyBpcyBhbiBpbnNhbmVseSBuZWdsaWdlbnQgZml4LiBKdXN0IHNheWluZyB0byBjb21wbGV0ZSBoZWxsIHdpdGggdGhlIHJlc291cmNlLiBCdXQsIGdyYWRlIG1lbG9uIGRvZXNuJ3QgdXNlIGl0LiBTbyBJIGRvbid0IGNhcmUuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFtdIDogW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICB9KSkgYXMgQXNzaWdubWVudFtdKVxyXG4gICAgICAgICAgICAgICAgICAgIDogW10sXHJcbiAgICAgICAgICAgICAgfSkpKSBhcyBNYXJrW106W3sgbmFtZTogXCJub25lXCIsIGNhbGN1bGF0ZWRTY29yZTogeyBzdHJpbmc6IFwibm9uZVwiLCByYXc6IE5hTiB9LCB3ZWlnaHRlZENhdGVnb3JpZXM6IFtdLCBhc3NpZ25tZW50czogW10gfV0gYXMgTWFya1tdLFxyXG4gICAgICAgICAgICB9KSlcclxuICAgICAgICAgIHJldHVybiByZXNwb25zZSBhcyBHcmFkZWJvb2s7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgfSlcclxuXHJcblxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGEgbGlzdCBvZiBtZXNzYWdlcyBvZiB0aGUgc3R1ZGVudFxyXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPE1lc3NhZ2VbXT59IFJldHVybnMgYW4gYXJyYXkgb2YgbWVzc2FnZXMgb2YgdGhlIHN0dWRlbnRcclxuICAgKiBAZGVzY3JpcHRpb25cclxuICAgKiBgYGBqc1xyXG4gICAqIGF3YWl0IGNsaWVudC5tZXNzYWdlcygpOyAvLyAtPiBbeyBpZDogJ0U5NzJGMUJDLTk5QTAtNENEMC04RDE1LUIxODk2OEI0M0UwOCcsIHR5cGU6ICdTdHVkZW50QWN0aXZpdHknLCAuLi4gfSwgeyBpZDogJzg2RkRBMTFELTQyQzctNDI0OS1CMDAzLTk0QjE1RUIyQzhENCcsIHR5cGU6ICdTdHVkZW50QWN0aXZpdHknLCAuLi4gfV1cclxuICAgKiBgYGBcclxuICAgKi9cclxuICBwdWJsaWMgbWVzc2FnZXMoKTogUHJvbWlzZTxbTWVzc2FnZVtdLGFueV0+IHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IHtcclxuICAgICAgc3VwZXJcclxuICAgICAgICAucHJvY2Vzc1JlcXVlc3Q8TWVzc2FnZVhNTE9iamVjdD4oXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIG1ldGhvZE5hbWU6ICdHZXRQWFBNZXNzYWdlcycsXHJcbiAgICAgICAgICAgIHBhcmFtU3RyOiB7IGNoaWxkSW50SWQ6IDAgfSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICAoeG1sKSA9PiBuZXcgWE1MRmFjdG9yeSh4bWwpLmVuY29kZUF0dHJpYnV0ZSgnQ29udGVudCcsICdSZWFkJykudG9TdHJpbmcoKVxyXG4gICAgICAgIClcclxuICAgICAgICAudGhlbigoeG1sT2JqZWN0KSA9PiB7XHJcbiAgICAgICAgICByZXMoW1xyXG4gICAgICAgICAgICB4bWxPYmplY3QuUFhQTWVzc2FnZXNEYXRhWzBdLk1lc3NhZ2VMaXN0aW5nc1swXS5NZXNzYWdlTGlzdGluZy5tYXAoXHJcbiAgICAgICAgICAgICAgKG1lc3NhZ2UpID0+IG5ldyBNZXNzYWdlKG1lc3NhZ2UsIHN1cGVyLmNyZWRlbnRpYWxzLCB0aGlzLmhvc3RVcmwpXHJcbiAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSAvL2Z1Y2tpbmcgc3VlIG1lXHJcbiAgICAgICAgICAgICkseG1sT2JqZWN0Py5leHRyYURhdGFdXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKHJlaik7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG5cclxuXHJcbiAgLy9hbHRuZXJhdGUgbWV0aG9kIGZvciBzdHVkZW50SW5mbyB3aGVuIHN0dWRlbnRJbmZvIGZhaWxzOlxyXG4gIC8vdGhvc2UgdGhpbmdzIGNvbW1lbnRlZCBvdXQgYXJlIG5vdCBhcHBsaWNhYmxlIGhlcmVcclxuICBwdWJsaWMgQ2hpbGRMaXN0KCk6UHJvbWlzZTxbU3R1ZGVudEluZm8sYW55XT57XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2U8W1N0dWRlbnRJbmZvLGFueV0+KChyZXMscmVqKT0+e1xyXG4gICAgICBzdXBlclxyXG4gICAgICAgIC5wcm9jZXNzUmVxdWVzdCh7bWV0aG9kTmFtZTpcIkNoaWxkTGlzdFwifSlcclxuICAgICAgICAgIC50aGVuKCh4bWxPYmplY3Q6YW55KT0+e1xyXG4gICAgICAgICAgICBjb25zdCByYXc9eG1sT2JqZWN0O1xyXG4gICAgICAgICAgICB4bWxPYmplY3Q9eG1sT2JqZWN0LkNoaWxkTGlzdFswXTtcclxuXHJcbiAgICAgICAgICAgIHJlcyhbe1xyXG4gICAgICAgICAgICBzdHVkZW50OntcclxuICAgICAgICAgICAgICBuYW1lOnhtbE9iamVjdC5DaGlsZFswXS5DaGlsZE5hbWUsIC8vZnVsbCBOYW1lIG9uIHRoaXMgZmFsbGJhY2sgbWV0aG9kXHJcbiAgICAgICAgICAgICAgbGFzdE5hbWU6XCJub3QgYXZhaWxhYmxlXCIsXHJcbiAgICAgICAgICAgICAgbmlja25hbWU6XCJub3QgYXZhaWxhYmxlXCJ9LFxyXG4gICAgICAgICAgLy8gIGJpcnRoRGF0ZTpuZXcgRGF0ZSgpLFxyXG4gICAgICAgICAgIC8vIHRyYWNrOlwibm90IGF2YWlsYWJsZVwiLFxyXG4gICAgICAgICAgIC8vIGFkZHJlc3M6XCJub3QgYXZhaWxhYmxlXCIsXHJcbiAgICAgICAgICAgIHBob3RvOm9wdGlvbmFsKHhtbE9iamVjdC5DaGlsZFswXS5waG90byksXHJcbiAgICAgICAgICAgIGNvdW5zZWxvcjp1bmRlZmluZWQsXHJcbiAgICAgICAgICAgIGN1cnJlbnRTY2hvb2w6eG1sT2JqZWN0LkNoaWxkWzBdLk9yZ2FuaXphdGlvbk5hbWVbMF0sXHJcbiAgICAgICAgICAgLy8gZGVudGlzdDp1bmRlZmluZWQsXHJcbiAgICAgICAgICAgIC8vIHBoeXNpY2lhbjp1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgaWQ6b3B0aW9uYWwoeG1sT2JqZWN0LkNoaWxkWzBdWydAX0NoaWxkUGVybUlEJ10pLFxyXG4gICAgICAgICAgICAgIG9yZ1llYXJHdTpvcHRpb25hbCh4bWxPYmplY3QuQ2hpbGRbMF1bJ0BfT3JnWWVhckdVJ10pLFxyXG4gICAgICAgICAgICAgIC8vcGhvbmU6XCJub3QgYXZhaWxhYmxlXCIsXHJcbiAgICAgICAgICAgICAgLy9lbWFpbDpcIm5vdCBhdmFpbGFibGVcIixcclxuICAgICAgICAgICAgICAvL2VtZXJnZW5jeUNvbnRhY3RzOnVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICBnZW5kZXI6XCJudWxsXCIsXHJcbiAgICAgICAgICAgICAgZ3JhZGU6b3B0aW9uYWwoeG1sT2JqZWN0LkNoaWxkWzBdLkdyYWRlKSxcclxuXHJcblxyXG5cclxuXHJcbiAgICAgICAgICB9IGFzIFN0dWRlbnRJbmZvLHJhdy5leHRyYURhdGFdKX0pXHJcbiAgICAgICAgICAuY2F0Y2gocmVqKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBpbmZvIG9mIGEgc3R1ZGVudFxyXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPFN0dWRlbnRJbmZvPn0gU3R1ZGVudEluZm8gb2JqZWN0XHJcbiAgICogQGRlc2NyaXB0aW9uXHJcbiAgICogYGBganNcclxuICAgKiBzdHVkZW50SW5mbygpLnRoZW4oY29uc29sZS5sb2cpIC8vIC0+IHsgc3R1ZGVudDogeyBuYW1lOiAnRXZhbiBEYXZpcycsIG5pY2tuYW1lOiAnJywgbGFzdE5hbWU6ICdEYXZpcycgfSwgLi4ufVxyXG4gICAqIGBgYFxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdHVkZW50SW5mbygpOiBQcm9taXNlPFtTdHVkZW50SW5mbyxhbnldPiB7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2U8W1N0dWRlbnRJbmZvLGFueV0+KChyZXMsIHJlaikgPT4ge1xyXG4gICAgICBzdXBlclxyXG4gICAgICAgIC5wcm9jZXNzUmVxdWVzdDxTdHVkZW50SW5mb1hNTE9iamVjdD4oe1xyXG4gICAgICAgICAgbWV0aG9kTmFtZTogJ1N0dWRlbnRJbmZvJyxcclxuICAgICAgICAgIHBhcmFtU3RyOiB7IGNoaWxkSW50SWQ6IDAgfSxcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKCh4bWxPYmplY3REYXRhKSA9PiB7XHJcbiAgICAgICAgICByZXMoW3tcclxuICAgICAgICAgICAgc3R1ZGVudDoge1xyXG4gICAgICAgICAgICAgIG5hbWU6IHhtbE9iamVjdERhdGEuU3R1ZGVudEluZm9bMF0uRm9ybWF0dGVkTmFtZVswXSxcclxuICAgICAgICAgICAgICBsYXN0TmFtZTogeG1sT2JqZWN0RGF0YS5TdHVkZW50SW5mb1swXS5MYXN0TmFtZUdvZXNCeVswXSxcclxuICAgICAgICAgICAgICBuaWNrbmFtZTogeG1sT2JqZWN0RGF0YS5TdHVkZW50SW5mb1swXS5OaWNrTmFtZVswXSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYmlydGhEYXRlOiBuZXcgRGF0ZSh4bWxPYmplY3REYXRhLlN0dWRlbnRJbmZvWzBdLkJpcnRoRGF0ZVswXSksXHJcbiAgICAgICAgICAgIHRyYWNrOiBvcHRpb25hbCh4bWxPYmplY3REYXRhLlN0dWRlbnRJbmZvWzBdLlRyYWNrKSxcclxuICAgICAgICAgICAgYWRkcmVzczogb3B0aW9uYWwoeG1sT2JqZWN0RGF0YS5TdHVkZW50SW5mb1swXS5BZGRyZXNzKSxcclxuICAgICAgICAgICAgcGhvdG86IG9wdGlvbmFsKHhtbE9iamVjdERhdGEuU3R1ZGVudEluZm9bMF0uUGhvdG8pLFxyXG4gICAgICAgICAgICBjb3Vuc2Vsb3I6XHJcbiAgICAgICAgICAgICAgeG1sT2JqZWN0RGF0YS5TdHVkZW50SW5mb1swXS5Db3Vuc2Vsb3JOYW1lICYmXHJcbiAgICAgICAgICAgICAgeG1sT2JqZWN0RGF0YS5TdHVkZW50SW5mb1swXS5Db3Vuc2Vsb3JFbWFpbCAmJlxyXG4gICAgICAgICAgICAgIHhtbE9iamVjdERhdGEuU3R1ZGVudEluZm9bMF0uQ291bnNlbG9yU3RhZmZHVVxyXG4gICAgICAgICAgICAgICAgPyB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogeG1sT2JqZWN0RGF0YS5TdHVkZW50SW5mb1swXS5Db3Vuc2Vsb3JOYW1lWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgIGVtYWlsOiB4bWxPYmplY3REYXRhLlN0dWRlbnRJbmZvWzBdLkNvdW5zZWxvckVtYWlsWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YWZmR3U6IHhtbE9iamVjdERhdGEuU3R1ZGVudEluZm9bMF0uQ291bnNlbG9yU3RhZmZHVVswXSxcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgIGN1cnJlbnRTY2hvb2w6IHhtbE9iamVjdERhdGEuU3R1ZGVudEluZm9bMF0uQ3VycmVudFNjaG9vbFswXSxcclxuICAgICAgICAgICAgZGVudGlzdDogeG1sT2JqZWN0RGF0YS5TdHVkZW50SW5mb1swXS5EZW50aXN0XHJcbiAgICAgICAgICAgICAgPyB7XHJcbiAgICAgICAgICAgICAgICAgIG5hbWU6IHhtbE9iamVjdERhdGEuU3R1ZGVudEluZm9bMF0uRGVudGlzdFswXVsnQF9OYW1lJ11bMF0sXHJcbiAgICAgICAgICAgICAgICAgIHBob25lOiB4bWxPYmplY3REYXRhLlN0dWRlbnRJbmZvWzBdLkRlbnRpc3RbMF1bJ0BfUGhvbmUnXVswXSxcclxuICAgICAgICAgICAgICAgICAgZXh0bjogeG1sT2JqZWN0RGF0YS5TdHVkZW50SW5mb1swXS5EZW50aXN0WzBdWydAX0V4dG4nXVswXSxcclxuICAgICAgICAgICAgICAgICAgb2ZmaWNlOiB4bWxPYmplY3REYXRhLlN0dWRlbnRJbmZvWzBdLkRlbnRpc3RbMF1bJ0BfT2ZmaWNlJ11bMF0sXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgIHBoeXNpY2lhbjogeG1sT2JqZWN0RGF0YS5TdHVkZW50SW5mb1swXS5QaHlzaWNpYW5cclxuICAgICAgICAgICAgICA/IHtcclxuICAgICAgICAgICAgICAgICAgbmFtZTogeG1sT2JqZWN0RGF0YS5TdHVkZW50SW5mb1swXS5QaHlzaWNpYW5bMF1bJ0BfTmFtZSddWzBdLFxyXG4gICAgICAgICAgICAgICAgICBwaG9uZTogeG1sT2JqZWN0RGF0YS5TdHVkZW50SW5mb1swXS5QaHlzaWNpYW5bMF1bJ0BfUGhvbmUnXVswXSxcclxuICAgICAgICAgICAgICAgICAgZXh0bjogeG1sT2JqZWN0RGF0YS5TdHVkZW50SW5mb1swXS5QaHlzaWNpYW5bMF1bJ0BfRXh0biddWzBdLFxyXG4gICAgICAgICAgICAgICAgICBob3NwaXRhbDogeG1sT2JqZWN0RGF0YS5TdHVkZW50SW5mb1swXS5QaHlzaWNpYW5bMF1bJ0BfSG9zcGl0YWwnXVswXSxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgaWQ6IG9wdGlvbmFsKHhtbE9iamVjdERhdGEuU3R1ZGVudEluZm9bMF0uUGVybUlEKSxcclxuICAgICAgICAgICAgb3JnWWVhckd1OiBvcHRpb25hbCh4bWxPYmplY3REYXRhLlN0dWRlbnRJbmZvWzBdLk9yZ1llYXJHVSksXHJcbiAgICAgICAgICAgIHBob25lOiBvcHRpb25hbCh4bWxPYmplY3REYXRhLlN0dWRlbnRJbmZvWzBdLlBob25lKSxcclxuICAgICAgICAgICAgZW1haWw6IG9wdGlvbmFsKHhtbE9iamVjdERhdGEuU3R1ZGVudEluZm9bMF0uRU1haWwpLFxyXG4gICAgICAgICAgICBlbWVyZ2VuY3lDb250YWN0czogeG1sT2JqZWN0RGF0YS5TdHVkZW50SW5mb1swXS5FbWVyZ2VuY3lDb250YWN0c1xyXG4gICAgICAgICAgICAgID8geG1sT2JqZWN0RGF0YS5TdHVkZW50SW5mb1swXS5FbWVyZ2VuY3lDb250YWN0c1swXS5FbWVyZ2VuY3lDb250YWN0Py5tYXAoKGNvbnRhY3QpID0+ICh7XHJcbiAgICAgICAgICAgICAgICAgIG5hbWU6IG9wdGlvbmFsKGNvbnRhY3RbJ0BfTmFtZSddKSxcclxuICAgICAgICAgICAgICAgICAgcGhvbmU6IHtcclxuICAgICAgICAgICAgICAgICAgICBob21lOiBvcHRpb25hbChjb250YWN0WydAX0hvbWVQaG9uZSddKSxcclxuICAgICAgICAgICAgICAgICAgICBtb2JpbGU6IG9wdGlvbmFsKGNvbnRhY3RbJ0BfTW9iaWxlUGhvbmUnXSksXHJcbiAgICAgICAgICAgICAgICAgICAgb3RoZXI6IG9wdGlvbmFsKGNvbnRhY3RbJ0BfT3RoZXJQaG9uZSddKSxcclxuICAgICAgICAgICAgICAgICAgICB3b3JrOiBvcHRpb25hbChjb250YWN0WydAX1dvcmtQaG9uZSddKSxcclxuICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgcmVsYXRpb25zaGlwOiBvcHRpb25hbChjb250YWN0WydAX1JlbGF0aW9uc2hpcCddKSxcclxuICAgICAgICAgICAgICAgIH0pKVxyXG4gICAgICAgICAgICAgIDogW10sXHJcbiAgICAgICAgICAgIGdlbmRlcjogb3B0aW9uYWwoeG1sT2JqZWN0RGF0YS5TdHVkZW50SW5mb1swXS5HZW5kZXIpLFxyXG4gICAgICAgICAgICBncmFkZTogb3B0aW9uYWwoeG1sT2JqZWN0RGF0YS5TdHVkZW50SW5mb1swXS5HcmFkZSksXHJcbiAgICAgICAgICAgIGxvY2tlckluZm9SZWNvcmRzOiBvcHRpb25hbCh4bWxPYmplY3REYXRhLlN0dWRlbnRJbmZvWzBdLkxvY2tlckluZm9SZWNvcmRzKSxcclxuICAgICAgICAgICAgaG9tZUxhbmd1YWdlOiBvcHRpb25hbCh4bWxPYmplY3REYXRhLlN0dWRlbnRJbmZvWzBdLkhvbWVMYW5ndWFnZSksXHJcbiAgICAgICAgICAgIGhvbWVSb29tOiBvcHRpb25hbCh4bWxPYmplY3REYXRhLlN0dWRlbnRJbmZvWzBdLkhvbWVSb29tKSxcclxuICAgICAgICAgICAgaG9tZVJvb21UZWFjaGVyOiB7XHJcbiAgICAgICAgICAgICAgZW1haWw6IG9wdGlvbmFsKHhtbE9iamVjdERhdGEuU3R1ZGVudEluZm9bMF0uSG9tZVJvb21UY2hFTWFpbCksXHJcbiAgICAgICAgICAgICAgbmFtZTogb3B0aW9uYWwoeG1sT2JqZWN0RGF0YS5TdHVkZW50SW5mb1swXS5Ib21lUm9vbVRjaCksXHJcbiAgICAgICAgICAgICAgc3RhZmZHdTogb3B0aW9uYWwoeG1sT2JqZWN0RGF0YS5TdHVkZW50SW5mb1swXS5Ib21lUm9vbVRjaFN0YWZmR1UpLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBhZGRpdGlvbmFsSW5mbzogeG1sT2JqZWN0RGF0YS5TdHVkZW50SW5mb1swXS5Vc2VyRGVmaW5lZEdyb3VwQm94ZXNbMF0uVXNlckRlZmluZWRHcm91cEJveFxyXG4gICAgICAgICAgICAgID8gKHhtbE9iamVjdERhdGEuU3R1ZGVudEluZm9bMF0uVXNlckRlZmluZWRHcm91cEJveGVzWzBdLlVzZXJEZWZpbmVkR3JvdXBCb3gubWFwKChkZWZpbmVkQm94KSA9PiAoe1xyXG4gICAgICAgICAgICAgICAgICBpZDogb3B0aW9uYWwoZGVmaW5lZEJveFsnQF9Hcm91cEJveElEJ10pLCAvLyBzdHJpbmcgfCB1bmRlZmluZWRcclxuICAgICAgICAgICAgICAgICAgdHlwZTogZGVmaW5lZEJveFsnQF9Hcm91cEJveExhYmVsJ11bMF0sIC8vIHN0cmluZ1xyXG4gICAgICAgICAgICAgICAgICB2Y0lkOiBvcHRpb25hbChkZWZpbmVkQm94WydAX1ZDSUQnXSksIC8vIHN0cmluZyB8IHVuZGVmaW5lZFxyXG4gICAgICAgICAgICAgICAgICBpdGVtczogZGVmaW5lZEJveC5Vc2VyRGVmaW5lZEl0ZW1zWzBdLlVzZXJEZWZpbmVkSXRlbS5tYXAoKGl0ZW0pID0+ICh7XHJcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50OiBpdGVtWydAX1NvdXJjZUVsZW1lbnQnXVswXSxcclxuICAgICAgICAgICAgICAgICAgICAgIG9iamVjdDogaXRlbVsnQF9Tb3VyY2VPYmplY3QnXVswXSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHZjSWQ6IGl0ZW1bJ0BfVkNJRCddWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBpdGVtWydAX1ZhbHVlJ11bMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogaXRlbVsnQF9JdGVtVHlwZSddWzBdLFxyXG4gICAgICAgICAgICAgICAgICB9KSkgYXMgQWRkaXRpb25hbEluZm9JdGVtW10sXHJcbiAgICAgICAgICAgICAgICB9KSkgYXMgQWRkaXRpb25hbEluZm9bXSlcclxuICAgICAgICAgICAgICA6IFtdLFxyXG4gICAgICAgICAgICAgIC8vQHRzLWlnbm9yZSBZb3Ugd2lsbCBuZXZlciBtYWtlIG1lIHVzZSB0eXBlU2NyaXB0LlxyXG4gICAgICAgICAgfSBhcyBTdHVkZW50SW5mbyx4bWxPYmplY3REYXRhLmV4dHJhRGF0YV0pO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKHJlaik7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZmV0Y2hFdmVudHNXaXRoaW5JbnRlcnZhbChkYXRlOiBEYXRlKSB7XHJcbiAgICByZXR1cm4gc3VwZXIucHJvY2Vzc1JlcXVlc3Q8Q2FsZW5kYXJYTUxPYmplY3Q+KFxyXG4gICAgICB7XHJcbiAgICAgICAgbWV0aG9kTmFtZTogJ1N0dWRlbnRDYWxlbmRhcicsXHJcbiAgICAgICAgcGFyYW1TdHI6IHsgY2hpbGRJbnRJZDogMCwgUmVxdWVzdERhdGU6IGRhdGUudG9JU09TdHJpbmcoKSB9LFxyXG4gICAgICB9LFxyXG4gICAgICAoeG1sKSA9PiBuZXcgWE1MRmFjdG9yeSh4bWwpLmVuY29kZUF0dHJpYnV0ZSgnVGl0bGUnLCAnSWNvbicpLnRvU3RyaW5nKClcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Q2FsZW5kYXJPcHRpb25zfSBvcHRpb25zIE9wdGlvbnMgdG8gcHJvdmlkZSBmb3IgY2FsZW5kYXIgbWV0aG9kLiBBbiBpbnRlcnZhbCBpcyByZXF1aXJlZC5cclxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxDYWxlbmRhcj59IFJldHVybnMgYSBDYWxlbmRhciBvYmplY3RcclxuICAgKiBAZGVzY3JpcHRpb25cclxuICAgKiBgYGBqc1xyXG4gICAqIGNsaWVudC5jYWxlbmRhcih7IGludGVydmFsOiB7IHN0YXJ0OiBuZXcgRGF0ZSgnNS8xLzIwMjInKSwgZW5kOiBuZXcgRGF0ZSgnOC8xLzIwMjEnKSB9LCBjb25jdXJyZW5jeTogbnVsbCB9KTsgLy8gLT4gTGltaXRsZXNzIGNvbmN1cnJlbmN5IChub3QgcmVjb21tZW5kZWQpXHJcbiAgICpcclxuICAgKiBjb25zdCBjYWxlbmRhciA9IGF3YWl0IGNsaWVudC5jYWxlbmRhcih7IGludGVydmFsOiB7IC4uLiB9fSk7XHJcbiAgICogY29uc29sZS5sb2coY2FsZW5kYXIpOyAvLyAtPiB7IHNjaG9vbERhdGU6IHsuLi59LCBvdXRwdXRSYW5nZTogey4uLn0sIGV2ZW50czogWy4uLl0gfVxyXG4gICAqIGBgYFxyXG4gICAqL1xyXG4gIHB1YmxpYyBhc3luYyBjYWxlbmRhcihvcHRpb25zOiBDYWxlbmRhck9wdGlvbnMgPSB7fSk6IFByb21pc2U8Q2FsZW5kYXI+IHtcclxuICAgIGNvbnN0IGRlZmF1bHRPcHRpb25zOiBDYWxlbmRhck9wdGlvbnMgPSB7XHJcbiAgICAgIGNvbmN1cnJlbmN5OiA3LFxyXG4gICAgICAuLi5vcHRpb25zLFxyXG4gICAgfTtcclxuICAgIGNvbnN0IGNhbCA9IGF3YWl0IGNhY2hlLm1lbW8oKCkgPT4gdGhpcy5mZXRjaEV2ZW50c1dpdGhpbkludGVydmFsKG5ldyBEYXRlKCkpKTtcclxuICAgIGNvbnN0IHNjaG9vbEVuZERhdGU6IERhdGUgfCBudW1iZXIgPVxyXG4gICAgICBvcHRpb25zLmludGVydmFsPy5lbmQgPz8gbmV3IERhdGUoY2FsLkNhbGVuZGFyTGlzdGluZ1swXVsnQF9TY2hvb2xFbmREYXRlJ11bMF0pO1xyXG4gICAgY29uc3Qgc2Nob29sU3RhcnREYXRlOiBEYXRlIHwgbnVtYmVyID1cclxuICAgICAgb3B0aW9ucy5pbnRlcnZhbD8uc3RhcnQgPz8gbmV3IERhdGUoY2FsLkNhbGVuZGFyTGlzdGluZ1swXVsnQF9TY2hvb2xCZWdEYXRlJ11bMF0pO1xyXG5cclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IHtcclxuICAgICAgY29uc3QgbW9udGhzV2l0aGluU2Nob29sWWVhciA9IGVhY2hNb250aE9mSW50ZXJ2YWwoeyBzdGFydDogc2Nob29sU3RhcnREYXRlLCBlbmQ6IHNjaG9vbEVuZERhdGUgfSk7XHJcbiAgICAgIGNvbnN0IGdldEFsbEV2ZW50c1dpdGhpblNjaG9vbFllYXIgPSAoKTogUHJvbWlzZTxDYWxlbmRhclhNTE9iamVjdFtdPiA9PlxyXG4gICAgICAgIGRlZmF1bHRPcHRpb25zLmNvbmN1cnJlbmN5ID09IG51bGxcclxuICAgICAgICAgID8gUHJvbWlzZS5hbGwobW9udGhzV2l0aGluU2Nob29sWWVhci5tYXAoKGRhdGU6IERhdGUpID0+IHRoaXMuZmV0Y2hFdmVudHNXaXRoaW5JbnRlcnZhbChkYXRlKSkpXHJcbiAgICAgICAgICA6IGFzeW5jUG9vbEFsbChkZWZhdWx0T3B0aW9ucy5jb25jdXJyZW5jeSwgbW9udGhzV2l0aGluU2Nob29sWWVhciwgKGRhdGU6YW55KSA9PlxyXG4gICAgICAgICAgICAgIHRoaXMuZmV0Y2hFdmVudHNXaXRoaW5JbnRlcnZhbChkYXRlKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICBsZXQgbWVtbzogQ2FsZW5kYXIgfCBudWxsID0gbnVsbDtcclxuICAgICAgZ2V0QWxsRXZlbnRzV2l0aGluU2Nob29sWWVhcigpXHJcbiAgICAgICAgLnRoZW4oKGV2ZW50cykgPT4ge1xyXG4gICAgICAgICAgY29uc3QgYWxsRXZlbnRzID0gZXZlbnRzLnJlZHVjZSgocHJldiwgZXZlbnRzKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChtZW1vID09IG51bGwpXHJcbiAgICAgICAgICAgICAgbWVtbyA9IHtcclxuICAgICAgICAgICAgICAgIHNjaG9vbERhdGU6IHtcclxuICAgICAgICAgICAgICAgICAgc3RhcnQ6IG5ldyBEYXRlKGV2ZW50cy5DYWxlbmRhckxpc3RpbmdbMF1bJ0BfU2Nob29sQmVnRGF0ZSddWzBdKSxcclxuICAgICAgICAgICAgICAgICAgZW5kOiBuZXcgRGF0ZShldmVudHMuQ2FsZW5kYXJMaXN0aW5nWzBdWydAX1NjaG9vbEVuZERhdGUnXVswXSksXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb3V0cHV0UmFuZ2U6IHtcclxuICAgICAgICAgICAgICAgICAgc3RhcnQ6IHNjaG9vbFN0YXJ0RGF0ZSxcclxuICAgICAgICAgICAgICAgICAgZW5kOiBzY2hvb2xFbmREYXRlLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGV2ZW50czogW10sXHJcbiAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY29uc3QgcmVzdDogQ2FsZW5kYXIgPSB7XHJcbiAgICAgICAgICAgICAgLi4ubWVtbywgLy8gVGhpcyBpcyB0byBwcmV2ZW50IHJlLWluaXRpYWxpemluZyBEYXRlIG9iamVjdHMgaW4gb3JkZXIgdG8gaW1wcm92ZSBwZXJmb3JtYW5jZVxyXG4gICAgICAgICAgICAgIGV2ZW50czogW1xyXG4gICAgICAgICAgICAgICAgLi4uKHByZXYuZXZlbnRzID8gcHJldi5ldmVudHMgOiBbXSksXHJcbiAgICAgICAgICAgICAgICAuLi4odHlwZW9mIGV2ZW50cy5DYWxlbmRhckxpc3RpbmdbMF0uRXZlbnRMaXN0c1swXSAhPT0gJ3N0cmluZydcclxuICAgICAgICAgICAgICAgICAgPyAoZXZlbnRzLkNhbGVuZGFyTGlzdGluZ1swXS5FdmVudExpc3RzWzBdLkV2ZW50TGlzdC5tYXAoKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKGV2ZW50WydAX0RheVR5cGUnXVswXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIEV2ZW50VHlwZS5BU1NJR05NRU5UOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYXNzaWdubWVudEV2ZW50ID0gZXZlbnQgYXMgQXNzaWdubWVudEV2ZW50WE1MT2JqZWN0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogZGVjb2RlVVJJKGFzc2lnbm1lbnRFdmVudFsnQF9UaXRsZSddWzBdKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZExpbmtEYXRhOiBhc3NpZ25tZW50RXZlbnRbJ0BfQWRkTGlua0RhdGEnXVswXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFndTogYXNzaWdubWVudEV2ZW50WydAX0FHVSddID8gYXNzaWdubWVudEV2ZW50WydAX0FHVSddWzBdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZTogbmV3IERhdGUoYXNzaWdubWVudEV2ZW50WydAX0RhdGUnXVswXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZ3U6IGFzc2lnbm1lbnRFdmVudFsnQF9ER1UnXVswXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbms6IGFzc2lnbm1lbnRFdmVudFsnQF9MaW5rJ11bMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydFRpbWU6IGFzc2lnbm1lbnRFdmVudFsnQF9TdGFydFRpbWUnXVswXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IEV2ZW50VHlwZS5BU1NJR05NRU5ULFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlld1R5cGU6IGFzc2lnbm1lbnRFdmVudFsnQF9WaWV3VHlwZSddWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0gYXMgQXNzaWdubWVudEV2ZW50O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgRXZlbnRUeXBlLkhPTElEQVk6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGRlY29kZVVSSShldmVudFsnQF9UaXRsZSddWzBdKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IEV2ZW50VHlwZS5IT0xJREFZLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRUaW1lOiBldmVudFsnQF9TdGFydFRpbWUnXVswXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGU6IG5ldyBEYXRlKGV2ZW50WydAX0RhdGUnXVswXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSBhcyBIb2xpZGF5RXZlbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBFdmVudFR5cGUuUkVHVUxBUjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlZ3VsYXJFdmVudCA9IGV2ZW50IGFzIFJlZ3VsYXJFdmVudFhNTE9iamVjdDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGRlY29kZVVSSShyZWd1bGFyRXZlbnRbJ0BfVGl0bGUnXVswXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZ3U6IHJlZ3VsYXJFdmVudFsnQF9BR1UnXSA/IHJlZ3VsYXJFdmVudFsnQF9BR1UnXVswXSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGU6IG5ldyBEYXRlKHJlZ3VsYXJFdmVudFsnQF9EYXRlJ11bMF0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHJlZ3VsYXJFdmVudFsnQF9FdnREZXNjcmlwdGlvbiddXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gcmVndWxhckV2ZW50WydAX0V2dERlc2NyaXB0aW9uJ11bMF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZ3U6IHJlZ3VsYXJFdmVudFsnQF9ER1UnXSA/IHJlZ3VsYXJFdmVudFsnQF9ER1UnXVswXSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbms6IHJlZ3VsYXJFdmVudFsnQF9MaW5rJ10gPyByZWd1bGFyRXZlbnRbJ0BfTGluayddWzBdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRUaW1lOiByZWd1bGFyRXZlbnRbJ0BfU3RhcnRUaW1lJ11bMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBFdmVudFR5cGUuUkVHVUxBUixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZXdUeXBlOiByZWd1bGFyRXZlbnRbJ0BfVmlld1R5cGUnXSA/IHJlZ3VsYXJFdmVudFsnQF9WaWV3VHlwZSddWzBdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkTGlua0RhdGE6IHJlZ3VsYXJFdmVudFsnQF9BZGRMaW5rRGF0YSddID8gcmVndWxhckV2ZW50WydAX0FkZExpbmtEYXRhJ11bMF0gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSBhcyBSZWd1bGFyRXZlbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KSBhcyBFdmVudFtdKVxyXG4gICAgICAgICAgICAgICAgICA6IFtdKSxcclxuICAgICAgICAgICAgICBdIGFzIEV2ZW50W10sXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdDtcclxuICAgICAgICAgIH0sIHt9IGFzIENhbGVuZGFyKTtcclxuICAgICAgICAgIHJlcyh7IC4uLmFsbEV2ZW50cywgZXZlbnRzOiBfLnVuaXFCeShhbGxFdmVudHMuZXZlbnRzLCAoaXRlbTogeyB0aXRsZTogYW55OyB9KSA9PiBpdGVtLnRpdGxlKSB9IGFzIENhbGVuZGFyKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChyZWopO1xyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBK0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNlLE1BQU1BLE1BQU0sU0FBU0MsYUFBSSxDQUFDRCxNQUFNLENBQUM7SUFFOUNFLFdBQVcsQ0FBQ0MsV0FBNkIsRUFBRUMsUUFBZSxFQUFDQyxPQUFlLEVBQUU7TUFDMUUsS0FBSyxDQUFDRixXQUFXLEVBQUNDLFFBQVEsQ0FBQztNQUMzQixJQUFJLENBQUNDLE9BQU8sR0FBR0EsT0FBTztJQUN4Qjs7SUFFQTtBQUNGO0FBQ0E7SUFDU0MsbUJBQW1CLEdBQWtCO01BQzFDLE9BQU8sSUFBSUMsT0FBTyxDQUFDLENBQUNDLEdBQUcsRUFBRUMsR0FBRyxLQUFLO1FBQy9CLEtBQUssQ0FDRkMsY0FBYyxD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