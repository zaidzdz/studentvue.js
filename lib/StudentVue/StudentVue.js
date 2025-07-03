(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./Client/Client", "../utils/soap/soap"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./Client/Client"), require("../utils/soap/soap"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.Client, global.soap);
    global.StudentVue = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports, _Client, _soap) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "Client", {
    enumerable: true,
    get: function () {
      return _Client.default;
    }
  });
  _exports.findDistricts = findDistricts;
  _Client = _interopRequireDefault(_Client);
  _soap = _interopRequireDefault(_soap);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /** @module StudentVue */

  /**
   * Login to the StudentVUE API
   * @param {string} districtUrl The URL of the district which can be found using `findDistricts()` method
   * @param {UserCredentials} credentials User credentials of the student
   * @returns {Promise<Client>} Returns the client and the information of the student upon successful login
   */

  /*
  ||Disabling this function as I continue to externalize this shit (ts pmo)||
  
  export function login(districtUrl: string, credentials: UserCredentials,proxyUrl:string="https://studentvuelib.up.railway.app"): Promise<[Client,Gradebook,any]> {
    return new Promise((res, rej) => {
      if (districtUrl.length === 0)
        return rej(new RequestException({ message: 'District URL cannot be an empty string' }));
      const url = districtUrl.charAt(districtUrl.length - 1) === '/' ? districtUrl : `${districtUrl}/`;
      //stadardizes so u know it'll end in a slash fo sho
      const endpoint = url+"Service/PXPCommunication.asmx";
      const client = new Client(
        {
          username: credentials.username,
          password: credentials.password,
          districtUrl: endpoint,
          isParent: credentials.isParent,
          encrypted:credentials.encrypted
        },
        proxyUrl,url
      );
      client
        .gradebook()
        .then((response) => {
          console.log("immediate login response",response,proxyUrl);
          res([client,...response]);
        })
        .catch(rej);
  /*
      const p1=client.gradebook();
      const p2=client.ChildList();
      Promise.all([p1,p2]).then(all=>{
        const [grades,info]=all
        if(info.)
  
      })
        
      
    });
  }
  
  
  */

  /**
   * Find school districts using a zipcode
   * @param {string} zipCode The zipcode to get a list of schools from
   * @returns {Promise<SchoolDistrict[]>} Returns a list of school districts which can be used to login to the API
   */
  function findDistricts(zipCode) {
    return new Promise((res, reject) => {
      _soap.default.Client.processAnonymousRequest('https://support.edupoint.com/Service/HDInfoCommunication.asmx', {
        paramStr: {
          Key: '5E4B7859-B805-474B-A833-FDB15D205D40',
          MatchToDistrictZipCode: zipCode
        }
      }).then(xmlObject => {
        if (!xmlObject || !xmlObject.DistrictLists.DistrictInfos.DistrictInfo) {
          return res([]);
        }
        var _a = xmlObject.DistrictLists.DistrictInfos.DistrictInfo;
        var _f = district => {
          return {
            parentVueUrl: district['@_PvueURL'],
            address: district['@_Address'],
            id: district['@_DistrictID'],
            name: district['@_Name']
          };
        };
        var _r = [];
        for (var _i = 0; _i < _a.length; _i++) {
          _r.push(_f(_a[_i], _i, _a));
        }
        res(_r);
      }).catch(reject);
    });
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmaW5kRGlzdHJpY3RzIiwiemlwQ29kZSIsIlByb21pc2UiLCJyZXMiLCJyZWplY3QiLCJzb2FwIiwiQ2xpZW50IiwicHJvY2Vzc0Fub255bW91c1JlcXVlc3QiLCJwYXJhbVN0ciIsIktleSIsIk1hdGNoVG9EaXN0cmljdFppcENvZGUiLCJ0aGVuIiwieG1sT2JqZWN0IiwiRGlzdHJpY3RMaXN0cyIsIkRpc3RyaWN0SW5mb3MiLCJEaXN0cmljdEluZm8iLCJkaXN0cmljdCIsInBhcmVudFZ1ZVVybCIsImFkZHJlc3MiLCJpZCIsIm5hbWUiLCJjYXRjaCJdLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9TdHVkZW50VnVlL1N0dWRlbnRWdWUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU2Nob29sRGlzdHJpY3QsIFVzZXJDcmVkZW50aWFscyB9IGZyb20gJy4vU3R1ZGVudFZ1ZS5pbnRlcmZhY2VzJztcclxuaW1wb3J0IENsaWVudCBmcm9tICcuL0NsaWVudC9DbGllbnQnO1xyXG5pbXBvcnQgc29hcCBmcm9tICcuLi91dGlscy9zb2FwL3NvYXAnO1xyXG5pbXBvcnQgeyBEaXN0cmljdExpc3RYTUxPYmplY3QgfSBmcm9tICcuL1N0dWRlbnRWdWUueG1sJztcclxuaW1wb3J0IFJlcXVlc3RFeGNlcHRpb24gZnJvbSAnLi9SZXF1ZXN0RXhjZXB0aW9uL1JlcXVlc3RFeGNlcHRpb24nO1xyXG5pbXBvcnQgeyBHcmFkZWJvb2sgfSBmcm9tICcuL0NsaWVudC9DbGllbnQuaW50ZXJmYWNlcyc7XHJcblxyXG4vKiogQG1vZHVsZSBTdHVkZW50VnVlICovXHJcblxyXG4vKipcclxuICogTG9naW4gdG8gdGhlIFN0dWRlbnRWVUUgQVBJXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBkaXN0cmljdFVybCBUaGUgVVJMIG9mIHRoZSBkaXN0cmljdCB3aGljaCBjYW4gYmUgZm91bmQgdXNpbmcgYGZpbmREaXN0cmljdHMoKWAgbWV0aG9kXHJcbiAqIEBwYXJhbSB7VXNlckNyZWRlbnRpYWxzfSBjcmVkZW50aWFscyBVc2VyIGNyZWRlbnRpYWxzIG9mIHRoZSBzdHVkZW50XHJcbiAqIEByZXR1cm5zIHtQcm9taXNlPENsaWVudD59IFJldHVybnMgdGhlIGNsaWVudCBhbmQgdGhlIGluZm9ybWF0aW9uIG9mIHRoZSBzdHVkZW50IHVwb24gc3VjY2Vzc2Z1bCBsb2dpblxyXG4gKi9cclxuXHJcbi8qXHJcbnx8RGlzYWJsaW5nIHRoaXMgZnVuY3Rpb24gYXMgSSBjb250aW51ZSB0byBleHRlcm5hbGl6ZSB0aGlzIHNoaXQgKHRzIHBtbyl8fFxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGxvZ2luKGRpc3RyaWN0VXJsOiBzdHJpbmcsIGNyZWRlbnRpYWxzOiBVc2VyQ3JlZGVudGlhbHMscHJveHlVcmw6c3RyaW5nPVwiaHR0cHM6Ly9zdHVkZW50dnVlbGliLnVwLnJhaWx3YXkuYXBwXCIpOiBQcm9taXNlPFtDbGllbnQsR3JhZGVib29rLGFueV0+IHtcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlcywgcmVqKSA9PiB7XHJcbiAgICBpZiAoZGlzdHJpY3RVcmwubGVuZ3RoID09PSAwKVxyXG4gICAgICByZXR1cm4gcmVqKG5ldyBSZXF1ZXN0RXhjZXB0aW9uKHsgbWVzc2FnZTogJ0Rpc3RyaWN0IFVSTCBjYW5ub3QgYmUgYW4gZW1wdHkgc3RyaW5nJyB9KSk7XHJcbiAgICBjb25zdCB1cmwgPSBkaXN0cmljdFVybC5jaGFyQXQoZGlzdHJpY3RVcmwubGVuZ3RoIC0gMSkgPT09ICcvJyA/IGRpc3RyaWN0VXJsIDogYCR7ZGlzdHJpY3RVcmx9L2A7XHJcbiAgICAvL3N0YWRhcmRpemVzIHNvIHUga25vdyBpdCdsbCBlbmQgaW4gYSBzbGFzaCBmbyBzaG9cclxuICAgIGNvbnN0IGVuZHBvaW50ID0gdXJsK1wiU2VydmljZS9QWFBDb21tdW5pY2F0aW9uLmFzbXhcIjtcclxuICAgIGNvbnN0IGNsaWVudCA9IG5ldyBDbGllbnQoXHJcbiAgICAgIHtcclxuICAgICAgICB1c2VybmFtZTogY3JlZGVudGlhbHMudXNlcm5hbWUsXHJcbiAgICAgICAgcGFzc3dvcmQ6IGNyZWRlbnRpYWxzLnBhc3N3b3JkLFxyXG4gICAgICAgIGRpc3RyaWN0VXJsOiBlbmRwb2ludCxcclxuICAgICAgICBpc1BhcmVudDogY3JlZGVudGlhbHMuaXNQYXJlbnQsXHJcbiAgICAgICAgZW5jcnlwdGVkOmNyZWRlbnRpYWxzLmVuY3J5cHRlZFxyXG4gICAgICB9LFxyXG4gICAgICBwcm94eVVybCx1cmxcclxuICAgICk7XHJcbiAgICBjbGllbnRcclxuICAgICAgLmdyYWRlYm9vaygpXHJcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiaW1tZWRpYXRlIGxvZ2luIHJlc3BvbnNlXCIscmVzcG9uc2UscHJveHlVcmwpO1xyXG4gICAgICAgIHJlcyhbY2xpZW50LC4uLnJlc3BvbnNlXSk7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5jYXRjaChyZWopO1xyXG4vKlxyXG4gICAgY29uc3QgcDE9Y2xpZW50LmdyYWRlYm9vaygpO1xyXG4gICAgY29uc3QgcDI9Y2xpZW50LkNoaWxkTGlzdCgpO1xyXG4gICAgUHJvbWlzZS5hbGwoW3AxLHAyXSkudGhlbihhbGw9PntcclxuICAgICAgY29uc3QgW2dyYWRlcyxpbmZvXT1hbGxcclxuICAgICAgaWYoaW5mby4pXHJcblxyXG4gICAgfSlcclxuICAgICAgXHJcbiAgICBcclxuICB9KTtcclxufVxyXG5cclxuXHJcbiovXHJcblxyXG5cclxuLyoqXHJcbiAqIEZpbmQgc2Nob29sIGRpc3RyaWN0cyB1c2luZyBhIHppcGNvZGVcclxuICogQHBhcmFtIHtzdHJpbmd9IHppcENvZGUgVGhlIHppcGNvZGUgdG8gZ2V0IGEgbGlzdCBvZiBzY2hvb2xzIGZyb21cclxuICogQHJldHVybnMge1Byb21pc2U8U2Nob29sRGlzdHJpY3RbXT59IFJldHVybnMgYSBsaXN0IG9mIHNjaG9vbCBkaXN0cmljdHMgd2hpY2ggY2FuIGJlIHVzZWQgdG8gbG9naW4gdG8gdGhlIEFQSVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZpbmREaXN0cmljdHMoemlwQ29kZTogc3RyaW5nKTogUHJvbWlzZTxTY2hvb2xEaXN0cmljdFtdPiB7XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXMsIHJlamVjdCkgPT4ge1xyXG4gICAgc29hcC5DbGllbnQucHJvY2Vzc0Fub255bW91c1JlcXVlc3Q8RGlzdHJpY3RMaXN0WE1MT2JqZWN0IHwgdW5kZWZpbmVkPihcclxuICAgICAgJ2h0dHBzOi8vc3VwcG9ydC5lZHVwb2ludC5jb20vU2VydmljZS9IREluZm9Db21tdW5pY2F0aW9uLmFzbXgnLFxyXG4gICAgICB7XHJcbiAgICAgICAgcGFyYW1TdHI6IHtcclxuICAgICAgICAgIEtleTogJzVFNEI3ODU5LUI4MDUtNDc0Qi1BODMzLUZEQjE1RDIwNUQ0MCcsXHJcbiAgICAgICAgICBNYXRjaFRvRGlzdHJpY3RaaXBDb2RlOiB6aXBDb2RlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH1cclxuICAgIClcclxuICAgICAgLnRoZW4oKHhtbE9iamVjdCkgPT4ge1xyXG4gICAgICAgIGlmICgheG1sT2JqZWN0IHx8ICF4bWxPYmplY3QuRGlzdHJpY3RMaXN0cy5EaXN0cmljdEluZm9zLkRpc3RyaWN0SW5mbykgcmV0dXJuIHJlcyhbXSk7XHJcbiAgICAgICAgcmVzKFxyXG4gICAgICAgICAgeG1sT2JqZWN0LkRpc3RyaWN0TGlzdHMuRGlzdHJpY3RJbmZvcy5EaXN0cmljdEluZm8ubWFwKChkaXN0cmljdCkgPT4gKHtcclxuICAgICAgICAgICAgcGFyZW50VnVlVXJsOiBkaXN0cmljdFsnQF9QdnVlVVJMJ10sXHJcbiAgICAgICAgICAgIGFkZHJlc3M6IGRpc3RyaWN0WydAX0FkZHJlc3MnXSxcclxuICAgICAgICAgICAgaWQ6IGRpc3RyaWN0WydAX0Rpc3RyaWN0SUQnXSxcclxuICAgICAgICAgICAgbmFtZTogZGlzdHJpY3RbJ0BfTmFtZSddLFxyXG4gICAgICAgICAgfSkpXHJcbiAgICAgICAgKTtcclxuICAgICAgfSlcclxuICAgICAgLmNhdGNoKHJlamVjdCk7XHJcbiAgfSk7XHJcbn1cclxuXHJcblxyXG5leHBvcnQge0NsaWVudH0iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFPQTs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztFQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDTyxTQUFTQSxhQUFhLENBQUNDLE9BQWUsRUFBNkI7SUFDeEUsT0FBTyxJQUFJQyxPQUFPLENBQUMsQ0FBQ0MsR0FBRyxFQUFFQyxNQUFNLEtBQUs7TUFDbENDLGFBQUksQ0FBQ0MsTUFBTSxDQUFDQyx1QkFBdUIsQ0FDakMsK0RBQStELEVBQy9EO1FBQ0VDLFFBQVEsRUFBRTtVQUNSQyxHQUFHLEVBQUUsc0NBQXNDO1VBQzNDQyxzQkFBc0IsRUFBRVQ7UUFDMUI7TUFDRixDQUFDLENBQ0YsQ0FDRVUsSUFBSSxDQUFFQyxTQUFTLElBQUs7UUFDbkIsSUFBSSxDQUFDQSxTQUFTLElBQUksQ0FBQ0EsU0FBUyxDQUFDQyxhQUFhLENBQUNDLGFBQWEsQ0FBQ0MsWUFBWTtVQUFFLE9BQU9aLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFBQztRQUFBLFNBRXBGUyxTQUFTLENBQUNDLGFBQWEsQ0FBQ0MsYUFBYSxDQUFDQyxZQUFZO1FBQUEsU0FBTUMsUUFBUTtVQUFBLE9BQU07WUFDcEVDLFlBQVksRUFBRUQsUUFBUSxDQUFDLFdBQVcsQ0FBQztZQUNuQ0UsT0FBTyxFQUFFRixRQUFRLENBQUMsV0FBVyxDQUFDO1lBQzlCRyxFQUFFLEVBQUVILFFBQVEsQ0FBQyxjQUFjLENBQUM7WUFDNUJJLElBQUksRUFBRUosUUFBUSxDQUFDLFFBQVE7VUFDekIsQ0FBQztRQUFBLENBQUM7UUFBQTtRQUFBO1VBQUE7UUFBQTtRQU5KYixHQUFHLElBT0Y7TUFDSCxDQUFDLENBQUMsQ0FDRGtCLEtBQUssQ0FBQ2pCLE1BQU0sQ0FBQztJQUNsQixDQUFDLENBQUM7RUFDSjtBQUFDIn0=