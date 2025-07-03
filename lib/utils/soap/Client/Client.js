(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "axios", "fast-xml-parser", "../../../StudentVue/RequestException/RequestException"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("axios"), require("fast-xml-parser"), require("../../../StudentVue/RequestException/RequestException"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.axios, global.fastXmlParser, global.RequestException);
    global.Client = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports, _axios, _fastXmlParser, _RequestException) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _axios = _interopRequireDefault(_axios);
  _RequestException = _interopRequireDefault(_RequestException);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  class Client {
    get district() {
      return this.__district__;
    }
    get username() {
      return this.__username__;
    }
    get password() {
      return this.__password__;
    }
    get credentials() {
      return {
        username: this.username,
        password: this.password,
        districtUrl: this.district,
        encrypted: this.encrypted
      };
    }
    constructor(credentials, Purl = "https://studentvuelib.up.railway.app") {
      this.__username__ = credentials.username;
      this.__password__ = credentials.password;
      this.__district__ = credentials.districtUrl;
      this.isParent = credentials.isParent ? 1 : 0;
      this.encrypted = credentials.encrypted;
      console.log("i am the constructor", Purl, Client.url);
      Client.url = Purl;
    }

    /**
     * Create a POST request to synergy servers to fetch data
     * @param options Options to provide when making a XML request to the servers
     * @param preparse Runs before parsing the xml string into an object. Useful for mutating xml that could be parsed incorrectly by `fast-xml-parser`
     * @returns Returns an XML object that must be defined in a type declaration file.
     * @see https://github.com/StudentVue/docs
     * @description
     * ```js
     * super.processRequest({ methodName: 'Refer to StudentVue/docs', paramStr: { AnythingThatCanBePassed: true, AsLongAsItMatchesTheDocumentation: true }});
     * // This will make the XML request below:
     * ```
     * 
     * ```xml
     * <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <ProcessWebServiceRequest xmlns="http://edupoint.com/webservices/">
              <userID>STUDENT_USERNAME</userID>
              <password>STUDENT_PASSWORD</password>
              <skipLoginLog>1</skipLoginLog>
              <parent>0</parent>
              <webServiceHandleName>PXPWebServices</webServiceHandleName>
              <methodName>Refer to StudentVue/docs</methodName>
              <paramStr>
                <AnythingThatCanBePassed>true</AnythingThatCanBePassed>
                <AsLongAsItMatchesTheDocumentation>true</AsLongAsItMatchesTheDocumentation>
              </paramStr>
          </ProcessWebServiceRequest>
        </soap:Body>
    </soap:Envelope>
     * ```
     */

    processRequest(options, preparse = xml => {
      return xml;
    }) {
      const defaultOptions = {
        validateErrors: true,
        skipLoginLog: 0,
        parent: this.isParent,
        webServiceHandleName: 'PXPWebServices',
        paramStr: {},
        ...options
      };
      const expressUrl = Client.url;
      return new Promise((res, reject) => {
        const builder = new _fastXmlParser.XMLBuilder({
          ignoreAttributes: false,
          arrayNodeName: 'soap:Envelope',
          suppressEmptyNode: true
        });
        const xml = builder.build({
          'soap:Envelope': {
            '@_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
            '@_xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
            '@_xmlns:soap': 'http://schemas.xmlsoap.org/soap/envelope/',
            'soap:Body': {
              ProcessWebServiceRequestMultiWeb: {
                '@_xmlns': 'http://edupoint.com/webservices/',
                userID: this.username,
                password: this.password,
                ...defaultOptions,
                ...{
                  paramStr: Client.parseParamStr(defaultOptions.paramStr ?? {})
                }
              }
            }
          }
        });
        res(xml);
        /*
        I've decided to intercept the actual fetching and post-processing of requests due to the absolute
        pain it's been to leave it in the library
            .then(async(response:any) => {
            const realResponse=await response.json();
            if(!realResponse.status){return reject(new Error(realResponse.message))}
            else{var data=realResponse.response}
            console.log(data);
            const parser = new XMLParser({});
            const result: ParsedRequestResult = parser.parse(data);
            const parserTwo = new XMLParser({
              ignoreAttributes: false,
              isArray: () => true,
              processEntities: false,
              parseAttributeValue: false,
              parseTagValue: false,
            });
              const obj: any | ParsedRequestError = parserTwo.parse(
              preparse(
                result['soap:Envelope']['soap:Body'].ProcessWebServiceRequestMultiWebResponse.ProcessWebServiceRequestMultiWebResult
              )
            );
              if (defaultOptions.validateErrors && typeof obj === 'object' && 'RT_ERROR' in obj){
              return reject(new RequestException(obj));}
              console.log(JSON.stringify(obj),"captain, my captain")
           delete realResponse.response;delete realResponse.status;
           if(Object.keys(realResponse).length>0){
            obj.extraData=realResponse
           }
            res(obj as T);
          })
          .catch(reject);
           */
      });
    }

    parseRequest(xml, preparse = xml => {
      return xml;
    }) {
      const parser = new _fastXmlParser.XMLParser({});
      const result = parser.parse(xml);
      const parserTwo = new _fastXmlParser.XMLParser({
        ignoreAttributes: false,
        isArray: () => {
          return true;
        },
        processEntities: false,
        parseAttributeValue: false,
        parseTagValue: false
      });
      const obj = parserTwo.parse(preparse(result['soap:Envelope']['soap:Body'].ProcessWebServiceRequestMultiWebResponse.ProcessWebServiceRequestMultiWebResult));
      return obj;
    }
    static parseParamStr(input) {
      const builder = new _fastXmlParser.XMLBuilder({
        ignoreAttributes: false,
        arrayNodeName: 'Params',
        suppressEmptyNode: true,
        suppressBooleanAttributes: false
      });
      const xml = `<Parms>${builder.build(input)}</Parms>`;
      return xml;
    }
    static processAnonymousRequest(url, options = {}, preparse = d => {
      return d.replace(/&gt;/g, '>').replace(/&lt;/g, '<');
    }) {
      const defaultOptions = {
        skipLoginLog: 0,
        validateErrors: true,
        parent: 0,
        webServiceHandleName: 'HDInfoServices',
        methodName: 'GetMatchingDistrictList',
        paramStr: {},
        ...options
      };
      return new Promise((res, reject) => {
        const builder = new _fastXmlParser.XMLBuilder({
          ignoreAttributes: false,
          arrayNodeName: 'soap:Envelope',
          suppressEmptyNode: true
        });
        const xml = builder.build({
          'soap:Envelope': {
            '@_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
            '@_xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
            '@_xmlns:soap': 'http://schemas.xmlsoap.org/soap/envelope/',
            'soap:Body': {
              ProcessWebServiceRequest: {
                '@_xmlns': 'http://edupoint.com/webservices/',
                userID: 'EdupointDistrictInfo',
                password: 'Edup01nt',
                ...defaultOptions,
                ...{
                  paramStr: Client.parseParamStr(defaultOptions.paramStr ?? {})
                }
              }
            }
          }
        });
        _axios.default.post(url, xml, {
          headers: {
            'Content-Type': 'text/xml'
          }
        }).then(({
          data
        }) => {
          const parser = new _fastXmlParser.XMLParser({});
          const result = parser.parse(data);
          const parserTwo = new _fastXmlParser.XMLParser({
            ignoreAttributes: false
          });
          const obj = parserTwo.parse(preparse(result['soap:Envelope']['soap:Body'].ProcessWebServiceRequestResponse.ProcessWebServiceRequestResult));
          if (defaultOptions.validateErrors && typeof obj === 'object' && 'RT_ERROR' in obj) {
            return reject(new _RequestException.default(obj));
          }
          res(obj);
        }).catch(reject);
      });
    }
  }
  _exports.default = Client;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDbGllbnQiLCJkaXN0cmljdCIsIl9fZGlzdHJpY3RfXyIsInVzZXJuYW1lIiwiX191c2VybmFtZV9fIiwicGFzc3dvcmQiLCJfX3Bhc3N3b3JkX18iLCJjcmVkZW50aWFscyIsImRpc3RyaWN0VXJsIiwiZW5jcnlwdGVkIiwiY29uc3RydWN0b3IiLCJQdXJsIiwiaXNQYXJlbnQiLCJjb25zb2xlIiwibG9nIiwidXJsIiwicHJvY2Vzc1JlcXVlc3QiLCJvcHRpb25zIiwicHJlcGFyc2UiLCJ4bWwiLCJkZWZhdWx0T3B0aW9ucyIsInZhbGlkYXRlRXJyb3JzIiwic2tpcExvZ2luTG9nIiwicGFyZW50Iiwid2ViU2VydmljZUhhbmRsZU5hbWUiLCJwYXJhbVN0ciIsImV4cHJlc3NVcmwiLCJQcm9taXNlIiwicmVzIiwicmVqZWN0IiwiYnVpbGRlciIsIlhNTEJ1aWxkZXIiLCJpZ25vcmVBdHRyaWJ1dGVzIiwiYXJyYXlOb2RlTmFtZSIsInN1cHByZXNzRW1wdHlOb2RlIiwiYnVpbGQiLCJQcm9jZXNzV2ViU2VydmljZVJlcXVlc3RNdWx0aVdlYiIsInVzZXJJRCIsInBhcnNlUGFyYW1TdHIiLCJwYXJzZVJlcXVlc3QiLCJwYXJzZXIiLCJYTUxQYXJzZXIiLCJyZXN1bHQiLCJwYXJzZSIsInBhcnNlclR3byIsImlzQXJyYXkiLCJwcm9jZXNzRW50aXRpZXMiLCJwYXJzZUF0dHJpYnV0ZVZhbHVlIiwicGFyc2VUYWdWYWx1ZSIsIm9iaiIsIlByb2Nlc3NXZWJTZXJ2aWNlUmVxdWVzdE11bHRpV2ViUmVzcG9uc2UiLCJQcm9jZXNzV2ViU2VydmljZVJlcXVlc3RNdWx0aVdlYlJlc3VsdCIsImlucHV0Iiwic3VwcHJlc3NCb29sZWFuQXR0cmlidXRlcyIsInByb2Nlc3NBbm9ueW1vdXNSZXF1ZXN0IiwiZCIsInJlcGxhY2UiLCJtZXRob2ROYW1lIiwiUHJvY2Vzc1dlYlNlcnZpY2VSZXF1ZXN0IiwiYXhpb3MiLCJwb3N0IiwiaGVhZGVycyIsInRoZW4iLCJkYXRhIiwiUHJvY2Vzc1dlYlNlcnZpY2VSZXF1ZXN0UmVzcG9uc2UiLCJQcm9jZXNzV2ViU2VydmljZVJlcXVlc3RSZXN1bHQiLCJSZXF1ZXN0RXhjZXB0aW9uIiwiY2F0Y2giXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvdXRpbHMvc29hcC9DbGllbnQvQ2xpZW50LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBheGlvcyBmcm9tICdheGlvcyc7XHJcbmltcG9ydCB7IFhNTEJ1aWxkZXIsIFhNTFBhcnNlciB9IGZyb20gJ2Zhc3QteG1sLXBhcnNlcic7XHJcbmltcG9ydCB7XHJcbiAgUGFyc2VkUmVxdWVzdEVycm9yLFxyXG4gIFJlcXVlc3RPcHRpb25zLFxyXG4gIFBhcnNlZFJlcXVlc3RSZXN1bHQsXHJcbiAgUGFyc2VkQW5vbnltb3VzUmVxdWVzdEVycm9yLFxyXG4gIExvZ2luQ3JlZGVudGlhbHMsXHJcbn0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvc29hcC9DbGllbnQvQ2xpZW50LmludGVyZmFjZXMnO1xyXG5pbXBvcnQgUmVxdWVzdEV4Y2VwdGlvbiBmcm9tICcuLi8uLi8uLi9TdHVkZW50VnVlL1JlcXVlc3RFeGNlcHRpb24vUmVxdWVzdEV4Y2VwdGlvbic7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDbGllbnQge1xyXG4gIHByaXZhdGUgX191c2VybmFtZV9fOiBzdHJpbmc7XHJcbiAgcHJpdmF0ZSBfX3Bhc3N3b3JkX186IHN0cmluZztcclxuICBwcml2YXRlIF9fZGlzdHJpY3RfXzogc3RyaW5nO1xyXG4gIHByaXZhdGUgc3RhdGljIHVybDpzdHJpbmc7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBpc1BhcmVudDogbnVtYmVyO1xyXG4gIGVuY3J5cHRlZDogYm9vbGVhbjtcclxuXHJcbiAgcHJpdmF0ZSBnZXQgZGlzdHJpY3QoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiB0aGlzLl9fZGlzdHJpY3RfXztcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0IHVzZXJuYW1lKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gdGhpcy5fX3VzZXJuYW1lX187XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldCBwYXNzd29yZCgpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIHRoaXMuX19wYXNzd29yZF9fO1xyXG4gIH1cclxuXHJcbiAgcHJvdGVjdGVkIGdldCBjcmVkZW50aWFscygpOiBMb2dpbkNyZWRlbnRpYWxzIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHVzZXJuYW1lOiB0aGlzLnVzZXJuYW1lLFxyXG4gICAgICBwYXNzd29yZDogdGhpcy5wYXNzd29yZCxcclxuICAgICAgZGlzdHJpY3RVcmw6IHRoaXMuZGlzdHJpY3QsXHJcbiAgICAgIGVuY3J5cHRlZDp0aGlzLmVuY3J5cHRlZFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGNvbnN0cnVjdG9yKGNyZWRlbnRpYWxzOiBMb2dpbkNyZWRlbnRpYWxzLFB1cmw6c3RyaW5nPVwiaHR0cHM6Ly9zdHVkZW50dnVlbGliLnVwLnJhaWx3YXkuYXBwXCIpIHtcclxuICAgIHRoaXMuX191c2VybmFtZV9fID0gY3JlZGVudGlhbHMudXNlcm5hbWU7XHJcbiAgICB0aGlzLl9fcGFzc3dvcmRfXyA9IGNyZWRlbnRpYWxzLnBhc3N3b3JkO1xyXG4gICAgdGhpcy5fX2Rpc3RyaWN0X18gPSBjcmVkZW50aWFscy5kaXN0cmljdFVybDtcclxuICAgIHRoaXMuaXNQYXJlbnQgPSBjcmVkZW50aWFscy5pc1BhcmVudCA/IDEgOiAwO1xyXG4gICAgdGhpcy5lbmNyeXB0ZWQ9Y3JlZGVudGlhbHMuZW5jcnlwdGVkO1xyXG4gICAgY29uc29sZS5sb2coXCJpIGFtIHRoZSBjb25zdHJ1Y3RvclwiLFB1cmwsQ2xpZW50LnVybClcclxuICAgIENsaWVudC51cmw9UHVybDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZSBhIFBPU1QgcmVxdWVzdCB0byBzeW5lcmd5IHNlcnZlcnMgdG8gZmV0Y2ggZGF0YVxyXG4gICAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgdG8gcHJvdmlkZSB3aGVuIG1ha2luZyBhIFhNTCByZXF1ZXN0IHRvIHRoZSBzZXJ2ZXJzXHJcbiAgICogQHBhcmFtIHByZXBhcnNlIFJ1bnMgYmVmb3JlIHBhcnNpbmcgdGhlIHhtbCBzdHJpbmcgaW50byBhbiBvYmplY3QuIFVzZWZ1bCBmb3IgbXV0YXRpbmcgeG1sIHRoYXQgY291bGQgYmUgcGFyc2VkIGluY29ycmVjdGx5IGJ5IGBmYXN0LXhtbC1wYXJzZXJgXHJcbiAgICogQHJldHVybnMgUmV0dXJucyBhbiBYTUwgb2JqZWN0IHRoYXQgbXVzdCBiZSBkZWZpbmVkIGluIGEgdHlwZSBkZWNsYXJhdGlvbiBmaWxlLlxyXG4gICAqIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL1N0dWRlbnRWdWUvZG9jc1xyXG4gICAqIEBkZXNjcmlwdGlvblxyXG4gICAqIGBgYGpzXHJcbiAgICogc3VwZXIucHJvY2Vzc1JlcXVlc3QoeyBtZXRob2ROYW1lOiAnUmVmZXIgdG8gU3R1ZGVudFZ1ZS9kb2NzJywgcGFyYW1TdHI6IHsgQW55dGhpbmdUaGF0Q2FuQmVQYXNzZWQ6IHRydWUsIEFzTG9uZ0FzSXRNYXRjaGVzVGhlRG9jdW1lbnRhdGlvbjogdHJ1ZSB9fSk7XHJcbiAgICogLy8gVGhpcyB3aWxsIG1ha2UgdGhlIFhNTCByZXF1ZXN0IGJlbG93OlxyXG4gICAqIGBgYFxyXG4gICAqIFxyXG4gICAqIGBgYHhtbFxyXG4gICAqIDxzb2FwOkVudmVsb3BlIHhtbG5zOnhzaT1cImh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hLWluc3RhbmNlXCIgeG1sbnM6eHNkPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWFcIiB4bWxuczpzb2FwPVwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvc29hcC9lbnZlbG9wZS9cIj5cclxuICAgICAgPHNvYXA6Qm9keT5cclxuICAgICAgICA8UHJvY2Vzc1dlYlNlcnZpY2VSZXF1ZXN0IHhtbG5zPVwiaHR0cDovL2VkdXBvaW50LmNvbS93ZWJzZXJ2aWNlcy9cIj5cclxuICAgICAgICAgICAgPHVzZXJJRD5TVFVERU5UX1VTRVJOQU1FPC91c2VySUQ+XHJcbiAgICAgICAgICAgIDxwYXNzd29yZD5TVFVERU5UX1BBU1NXT1JEPC9wYXNzd29yZD5cclxuICAgICAgICAgICAgPHNraXBMb2dpbkxvZz4xPC9za2lwTG9naW5Mb2c+XHJcbiAgICAgICAgICAgIDxwYXJlbnQ+MDwvcGFyZW50PlxyXG4gICAgICAgICAgICA8d2ViU2VydmljZUhhbmRsZU5hbWU+UFhQV2ViU2VydmljZXM8L3dlYlNlcnZpY2VIYW5kbGVOYW1lPlxyXG4gICAgICAgICAgICA8bWV0aG9kTmFtZT5SZWZlciB0byBTdHVkZW50VnVlL2RvY3M8L21ldGhvZE5hbWU+XHJcbiAgICAgICAgICAgIDxwYXJhbVN0cj5cclxuICAgICAgICAgICAgICA8QW55dGhpbmdUaGF0Q2FuQmVQYXNzZWQ+dHJ1ZTwvQW55dGhpbmdUaGF0Q2FuQmVQYXNzZWQ+XHJcbiAgICAgICAgICAgICAgPEFzTG9uZ0FzSXRNYXRjaGVzVGhlRG9jdW1lbnRhdGlvbj50cnVlPC9Bc0xvbmdBc0l0TWF0Y2hlc1RoZURvY3VtZW50YXRpb24+XHJcbiAgICAgICAgICAgIDwvcGFyYW1TdHI+XHJcbiAgICAgICAgPC9Qcm9jZXNzV2ViU2VydmljZVJlcXVlc3Q+XHJcbiAgICAgIDwvc29hcDpCb2R5PlxyXG48L3NvYXA6RW52ZWxvcGU+XHJcbiAgICogYGBgXHJcbiAgICovXHJcbiAgXHJcbiAgcHVibGljIHByb2Nlc3NSZXF1ZXN0PFQgZXh0ZW5kcyBvYmplY3QgfCB1bmRlZmluZWQ+KFxyXG4gICAgb3B0aW9uczogUmVxdWVzdE9wdGlvbnMsXHJcbiAgICBwcmVwYXJzZTogKHhtbDogc3RyaW5nKSA9PiBzdHJpbmcgPSAoeG1sKSA9PiB4bWxcclxuICApOiBQcm9taXNlPFQ+IHtcclxuICAgIGNvbnN0IGRlZmF1bHRPcHRpb25zOiBSZXF1ZXN0T3B0aW9ucyA9IHtcclxuICAgICAgdmFsaWRhdGVFcnJvcnM6IHRydWUsXHJcbiAgICAgIHNraXBMb2dpbkxvZzogMCxcclxuICAgICAgcGFyZW50OiB0aGlzLmlzUGFyZW50LFxyXG4gICAgICB3ZWJTZXJ2aWNlSGFuZGxlTmFtZTogJ1BYUFdlYlNlcnZpY2VzJyxcclxuICAgICAgcGFyYW1TdHI6IHt9LFxyXG4gICAgICAuLi5vcHRpb25zLFxyXG4gICAgfTtcclxuICAgIGNvbnN0IGV4cHJlc3NVcmw9Q2xpZW50LnVybDtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzLCByZWplY3QpID0+IHtcclxuICAgICAgY29uc3QgYnVpbGRlciA9IG5ldyBYTUxCdWlsZGVyKHtcclxuICAgICAgICBpZ25vcmVBdHRyaWJ1dGVzOiBmYWxzZSxcclxuICAgICAgICBhcnJheU5vZGVOYW1lOiAnc29hcDpFbnZlbG9wZScsXHJcbiAgICAgICAgc3VwcHJlc3NFbXB0eU5vZGU6IHRydWUsXHJcbiAgICAgIH0pO1xyXG4gICAgICBjb25zdCB4bWwgPSBidWlsZGVyLmJ1aWxkKHtcclxuICAgICAgICAnc29hcDpFbnZlbG9wZSc6IHtcclxuICAgICAgICAgICdAX3htbG5zOnhzaSc6ICdodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYS1pbnN0YW5jZScsXHJcbiAgICAgICAgICAnQF94bWxuczp4c2QnOiAnaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEnLFxyXG4gICAgICAgICAgJ0BfeG1sbnM6c29hcCc6ICdodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy9zb2FwL2VudmVsb3BlLycsXHJcbiAgICAgICAgICAnc29hcDpCb2R5Jzoge1xyXG4gICAgICAgICAgICBQcm9jZXNzV2ViU2VydmljZVJlcXVlc3RNdWx0aVdlYjoge1xyXG4gICAgICAgICAgICAgICdAX3htbG5zJzogJ2h0dHA6Ly9lZHVwb2ludC5jb20vd2Vic2VydmljZXMvJyxcclxuICAgICAgICAgICAgICB1c2VySUQ6IHRoaXMudXNlcm5hbWUsXHJcbiAgICAgICAgICAgICAgcGFzc3dvcmQ6IHRoaXMucGFzc3dvcmQsXHJcbiAgICAgICAgICAgICAgLi4uZGVmYXVsdE9wdGlvbnMsXHJcbiAgICAgICAgICAgICAgLi4ueyBwYXJhbVN0cjogQ2xpZW50LnBhcnNlUGFyYW1TdHIoZGVmYXVsdE9wdGlvbnMucGFyYW1TdHIgPz8ge30pIH0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgcmVzKHhtbClcclxuICAgICAgLypcclxuSSd2ZSBkZWNpZGVkIHRvIGludGVyY2VwdCB0aGUgYWN0dWFsIGZldGNoaW5nIGFuZCBwb3N0LXByb2Nlc3Npbmcgb2YgcmVxdWVzdHMgZHVlIHRvIHRoZSBhYnNvbHV0ZVxyXG5wYWluIGl0J3MgYmVlbiB0byBsZWF2ZSBpdCBpbiB0aGUgbGlicmFyeVxyXG5cclxuICAgICAgICAudGhlbihhc3luYyhyZXNwb25zZTphbnkpID0+IHtcclxuICAgICAgICAgIGNvbnN0IHJlYWxSZXNwb25zZT1hd2FpdCByZXNwb25zZS5qc29uKCk7XHJcbiAgICAgICAgICBpZighcmVhbFJlc3BvbnNlLnN0YXR1cyl7cmV0dXJuIHJlamVjdChuZXcgRXJyb3IocmVhbFJlc3BvbnNlLm1lc3NhZ2UpKX1cclxuICAgICAgICAgIGVsc2V7dmFyIGRhdGE9cmVhbFJlc3BvbnNlLnJlc3BvbnNlfVxyXG4gICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XHJcbiAgICAgICAgICBjb25zdCBwYXJzZXIgPSBuZXcgWE1MUGFyc2VyKHt9KTtcclxuICAgICAgICAgIGNvbnN0IHJlc3VsdDogUGFyc2VkUmVxdWVzdFJlc3VsdCA9IHBhcnNlci5wYXJzZShkYXRhKTtcclxuICAgICAgICAgIGNvbnN0IHBhcnNlclR3byA9IG5ldyBYTUxQYXJzZXIoe1xyXG4gICAgICAgICAgICBpZ25vcmVBdHRyaWJ1dGVzOiBmYWxzZSxcclxuICAgICAgICAgICAgaXNBcnJheTogKCkgPT4gdHJ1ZSxcclxuICAgICAgICAgICAgcHJvY2Vzc0VudGl0aWVzOiBmYWxzZSxcclxuICAgICAgICAgICAgcGFyc2VBdHRyaWJ1dGVWYWx1ZTogZmFsc2UsXHJcbiAgICAgICAgICAgIHBhcnNlVGFnVmFsdWU6IGZhbHNlLFxyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgY29uc3Qgb2JqOiBhbnkgfCBQYXJzZWRSZXF1ZXN0RXJyb3IgPSBwYXJzZXJUd28ucGFyc2UoXHJcbiAgICAgICAgICAgIHByZXBhcnNlKFxyXG4gICAgICAgICAgICAgIHJlc3VsdFsnc29hcDpFbnZlbG9wZSddWydzb2FwOkJvZHknXS5Qcm9jZXNzV2ViU2VydmljZVJlcXVlc3RNdWx0aVdlYlJlc3BvbnNlLlByb2Nlc3NXZWJTZXJ2aWNlUmVxdWVzdE11bHRpV2ViUmVzdWx0XHJcbiAgICAgICAgICAgIClcclxuICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgaWYgKGRlZmF1bHRPcHRpb25zLnZhbGlkYXRlRXJyb3JzICYmIHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmICdSVF9FUlJPUicgaW4gb2JqKXtcclxuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChuZXcgUmVxdWVzdEV4Y2VwdGlvbihvYmopKTt9XHJcblxyXG4gICAgICAgICAgY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkob2JqKSxcImNhcHRhaW4sIG15IGNhcHRhaW5cIilcclxuICAgICAgICAgZGVsZXRlIHJlYWxSZXNwb25zZS5yZXNwb25zZTtkZWxldGUgcmVhbFJlc3BvbnNlLnN0YXR1cztcclxuICAgICAgICAgaWYoT2JqZWN0LmtleXMocmVhbFJlc3BvbnNlKS5sZW5ndGg+MCl7XHJcbiAgICAgICAgICBvYmouZXh0cmFEYXRhPXJlYWxSZXNwb25zZVxyXG4gICAgICAgICB9XHJcbiAgICAgICAgICByZXMob2JqIGFzIFQpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKHJlamVjdCk7XHJcbiAgICAgICAgICovXHJcbiAgICB9KTtcclxuICAgXHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcGFyc2VSZXF1ZXN0KHhtbDpzdHJpbmcscHJlcGFyc2U6ICh4bWw6IHN0cmluZykgPT4gc3RyaW5nID0gKHhtbCkgPT4geG1sKXtcclxuICAgICBjb25zdCBwYXJzZXIgPSBuZXcgWE1MUGFyc2VyKHt9KTtcclxuICAgICAgICAgIGNvbnN0IHJlc3VsdDogUGFyc2VkUmVxdWVzdFJlc3VsdCA9IHBhcnNlci5wYXJzZSh4bWwpO1xyXG4gICAgICAgICAgY29uc3QgcGFyc2VyVHdvID0gbmV3IFhNTFBhcnNlcih7XHJcbiAgICAgICAgICAgIGlnbm9yZUF0dHJpYnV0ZXM6IGZhbHNlLFxyXG4gICAgICAgICAgICBpc0FycmF5OiAoKSA9PiB0cnVlLFxyXG4gICAgICAgICAgICBwcm9jZXNzRW50aXRpZXM6IGZhbHNlLFxyXG4gICAgICAgICAgICBwYXJzZUF0dHJpYnV0ZVZhbHVlOiBmYWxzZSxcclxuICAgICAgICAgICAgcGFyc2VUYWdWYWx1ZTogZmFsc2UsXHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICBjb25zdCBvYmo6IGFueSB8IFBhcnNlZFJlcXVlc3RFcnJvciA9IHBhcnNlclR3by5wYXJzZShcclxuICAgICAgICAgICAgcHJlcGFyc2UoXHJcbiAgICAgICAgICAgICAgcmVzdWx0Wydzb2FwOkVudmVsb3BlJ11bJ3NvYXA6Qm9keSddLlByb2Nlc3NXZWJTZXJ2aWNlUmVxdWVzdE11bHRpV2ViUmVzcG9uc2UuUHJvY2Vzc1dlYlNlcnZpY2VSZXF1ZXN0TXVsdGlXZWJSZXN1bHRcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICByZXR1cm4gb2JqXHJcblxyXG4gIH1cclxuXHJcblxyXG4gIHByaXZhdGUgc3RhdGljIHBhcnNlUGFyYW1TdHIoaW5wdXQ6IG9iamVjdCk6IHN0cmluZyB7XHJcbiAgICBjb25zdCBidWlsZGVyID0gbmV3IFhNTEJ1aWxkZXIoe1xyXG4gICAgICBpZ25vcmVBdHRyaWJ1dGVzOiBmYWxzZSxcclxuICAgICAgYXJyYXlOb2RlTmFtZTogJ1BhcmFtcycsXHJcbiAgICAgIHN1cHByZXNzRW1wdHlOb2RlOiB0cnVlLFxyXG4gICAgICBzdXBwcmVzc0Jvb2xlYW5BdHRyaWJ1dGVzOiBmYWxzZSxcclxuICAgIH0pO1xyXG4gICAgY29uc3QgeG1sID0gYDxQYXJtcz4ke2J1aWxkZXIuYnVpbGQoaW5wdXQpfTwvUGFybXM+YDtcclxuICAgIHJldHVybiB4bWw7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhdGljIHByb2Nlc3NBbm9ueW1vdXNSZXF1ZXN0PFQgZXh0ZW5kcyBvYmplY3QgfCB1bmRlZmluZWQ+KFxyXG4gICAgdXJsOiBzdHJpbmcsXHJcbiAgICBvcHRpb25zOiBQYXJ0aWFsPFJlcXVlc3RPcHRpb25zPiA9IHt9LFxyXG4gICAgcHJlcGFyc2U6ICh4bWw6IHN0cmluZykgPT4gc3RyaW5nID0gKGQpID0+IGQucmVwbGFjZSgvJmd0Oy9nLCAnPicpLnJlcGxhY2UoLyZsdDsvZywgJzwnKVxyXG4gICk6IFByb21pc2U8VD4ge1xyXG4gICAgY29uc3QgZGVmYXVsdE9wdGlvbnM6IFJlcXVlc3RPcHRpb25zID0ge1xyXG4gICAgICBza2lwTG9naW5Mb2c6IDAsXHJcbiAgICAgIHZhbGlkYXRlRXJyb3JzOiB0cnVlLFxyXG4gICAgICBwYXJlbnQ6IDAsXHJcbiAgICAgIHdlYlNlcnZpY2VIYW5kbGVOYW1lOiAnSERJbmZvU2VydmljZXMnLFxyXG4gICAgICBtZXRob2ROYW1lOiAnR2V0TWF0Y2hpbmdEaXN0cmljdExpc3QnLFxyXG4gICAgICBwYXJhbVN0cjoge30sXHJcbiAgICAgIC4uLm9wdGlvbnMsXHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPFQ+KChyZXMsIHJlamVjdCkgPT4ge1xyXG4gICAgICBjb25zdCBidWlsZGVyID0gbmV3IFhNTEJ1aWxkZXIoe1xyXG4gICAgICAgIGlnbm9yZUF0dHJpYnV0ZXM6IGZhbHNlLFxyXG4gICAgICAgIGFycmF5Tm9kZU5hbWU6ICdzb2FwOkVudmVsb3BlJyxcclxuICAgICAgICBzdXBwcmVzc0VtcHR5Tm9kZTogdHJ1ZSxcclxuICAgICAgfSk7XHJcbiAgICAgIGNvbnN0IHhtbCA9IGJ1aWxkZXIuYnVpbGQoe1xyXG4gICAgICAgICdzb2FwOkVudmVsb3BlJzoge1xyXG4gICAgICAgICAgJ0BfeG1sbnM6eHNpJzogJ2h0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hLWluc3RhbmNlJyxcclxuICAgICAgICAgICdAX3htbG5zOnhzZCc6ICdodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYScsXHJcbiAgICAgICAgICAnQF94bWxuczpzb2FwJzogJ2h0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3NvYXAvZW52ZWxvcGUvJyxcclxuICAgICAgICAgICdzb2FwOkJvZHknOiB7XHJcbiAgICAgICAgICAgIFByb2Nlc3NXZWJTZXJ2aWNlUmVxdWVzdDoge1xyXG4gICAgICAgICAgICAgICdAX3htbG5zJzogJ2h0dHA6Ly9lZHVwb2ludC5jb20vd2Vic2VydmljZXMvJyxcclxuICAgICAgICAgICAgICB1c2VySUQ6ICdFZHVwb2ludERpc3RyaWN0SW5mbycsXHJcbiAgICAgICAgICAgICAgcGFzc3dvcmQ6ICdFZHVwMDFudCcsXHJcbiAgICAgICAgICAgICAgLi4uZGVmYXVsdE9wdGlvbnMsXHJcbiAgICAgICAgICAgICAgLi4ueyBwYXJhbVN0cjogQ2xpZW50LnBhcnNlUGFyYW1TdHIoZGVmYXVsdE9wdGlvbnMucGFyYW1TdHIgPz8ge30pIH0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgYXhpb3NcclxuICAgICAgICAucG9zdDxzdHJpbmc+KHVybCwgeG1sLCB7IGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICd0ZXh0L3htbCcgfSB9KVxyXG4gICAgICAgIC50aGVuKCh7IGRhdGEgfTp7ZGF0YTphbnl9KSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBwYXJzZXIgPSBuZXcgWE1MUGFyc2VyKHt9KTtcclxuICAgICAgICAgIGNvbnN0IHJlc3VsdDogUGFyc2VkUmVxdWVzdFJlc3VsdCA9IHBhcnNlci5wYXJzZShkYXRhKTtcclxuICAgICAgICAgIGNvbnN0IHBhcnNlclR3byA9IG5ldyBYTUxQYXJzZXIoeyBpZ25vcmVBdHRyaWJ1dGVzOiBmYWxzZSB9KTtcclxuXHJcbiAgICAgICAgICBjb25zdCBvYmo6IFQgfCBQYXJzZWRBbm9ueW1vdXNSZXF1ZXN0RXJyb3IgPSBwYXJzZXJUd28ucGFyc2UoXHJcbiAgICAgICAgICAgIHByZXBhcnNlKFxyXG4gICAgICAgICAgICAgIHJlc3VsdFsnc29hcDpFbnZlbG9wZSddWydzb2FwOkJvZHknXS5Qcm9jZXNzV2ViU2VydmljZVJlcXVlc3RSZXNwb25zZS5Qcm9jZXNzV2ViU2VydmljZVJlcXVlc3RSZXN1bHRcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICBpZiAoZGVmYXVsdE9wdGlvbnMudmFsaWRhdGVFcnJvcnMgJiYgdHlwZW9mIG9iaiA9PT0gJ29iamVjdCcgJiYgJ1JUX0VSUk9SJyBpbiBvYmopXHJcbiAgICAgICAgICAgIHJldHVybiByZWplY3QobmV3IFJlcXVlc3RFeGNlcHRpb24ob2JqKSk7XHJcblxyXG4gICAgICAgICAgcmVzKG9iaiBhcyBUKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChyZWplY3QpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQVdlLE1BQU1BLE1BQU0sQ0FBQztJQVExQixJQUFZQyxRQUFRLEdBQVc7TUFDN0IsT0FBTyxJQUFJLENBQUNDLFlBQVk7SUFDMUI7SUFFQSxJQUFZQyxRQUFRLEdBQVc7TUFDN0IsT0FBTyxJQUFJLENBQUNDLFlBQVk7SUFDMUI7SUFFQSxJQUFZQyxRQUFRLEdBQVc7TUFDN0IsT0FBTyxJQUFJLENBQUNDLFlBQVk7SUFDMUI7SUFFQSxJQUFjQyxXQUFXLEdBQXFCO01BQzVDLE9BQU87UUFDTEosUUFBUSxFQUFFLElBQUksQ0FBQ0EsUUFBUTtRQUN2QkUsUUFBUSxFQUFFLElBQUksQ0FBQ0EsUUFBUTtRQUN2QkcsV0FBVyxFQUFFLElBQUksQ0FBQ1AsUUFBUTtRQUMxQlEsU0FBUyxFQUFDLElBQUksQ0FBQ0E7TUFDakIsQ0FBQztJQUNIO0lBRUFDLFdBQVcsQ0FBQ0gsV0FBNkIsRUFBQ0ksSUFBVyxHQUFDLHNDQUFzQyxFQUFFO01BQzVGLElBQUksQ0FBQ1AsWUFBWSxHQUFHRyxXQUFXLENBQUNKLFFBQVE7TUFDeEMsSUFBSSxDQUFDRyxZQUFZLEdBQUdDLFdBQVcsQ0FBQ0YsUUFBUTtNQUN4QyxJQUFJLENBQUNILFlBQVksR0FBR0ssV0FBVyxDQUFDQyxXQUFXO01BQzNDLElBQUksQ0FBQ0ksUUFBUSxHQUFHTCxXQUFXLENBQUNLLFFBQVEsR0FBRyxDQUFDLEdBQUcsQ0FBQztNQUM1QyxJQUFJLENBQUNILFNBQVMsR0FBQ0YsV0FBVyxDQUFDRSxTQUFTO01BQ3BDSSxPQUFPLENBQUNDLEdBQUcsQ0FBQyxzQkFBc0IsRUFBQ0gsSUFBSSxFQUFDWCxNQUFNLENBQUNlLEdBQUcsQ0FBQztNQUNuRGYsTUFBTSxDQUFDZSxHQUFHLEdBQUNKLElBQUk7SUFDakI7O0lBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0lBRVNLLGNBQWMsQ0FDbkJDLE9BQXVCLEVBQ3ZCQyxRQUFpQyxHQUFJQyxHQUFHO01BQUEsT0FBS0EsR0FBRztJQUFBLEdBQ3BDO01BQ1osTUFBTUMsY0FBOEIsR0FBRztRQUNyQ0MsY0FBYyxFQUFFLElBQUk7UUFDcEJDLFlBQVksRUFBRSxDQUFDO1FBQ2ZDLE1BQU0sRUFBRSxJQUFJLENBQUNYLFFBQVE7UUFDckJZLG9CQUFvQixFQUFFLGdCQUFnQjtRQUN0Q0MsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUNaLEdBQUdSO01BQ0wsQ0FBQztNQUNELE1BQU1TLFVBQVUsR0FBQzFCLE1BQU0sQ0FBQ2UsR0FBRztNQUMzQixPQUFPLElBQUlZLE9BQU8sQ0FBQyxDQUFDQyxHQUFHLEVBQUVDLE1BQU0sS0FBSztRQUNsQyxNQUFNQyxPQUFPLEdBQUcsSUFBSUMseUJBQVUsQ0FBQztVQUM3QkMsZ0JBQWdCLEVBQUUsS0FBSztVQUN2QkMsYUFBYSxFQUFFLGVBQWU7VUFDOUJDLGlCQUFpQixFQUFFO1FBQ3JCLENBQUMsQ0FBQztRQUNGLE1BQU1mLEdBQUcsR0FBR1csT0FBTyxDQUFDSyxLQUFLLENBQUM7VUFDeEIsZUFBZSxFQUFFO1lBQ2YsYUFBYSxFQUFFLDJDQUEyQztZQUMxRCxhQUFhLEVBQUUsa0NBQWtDO1lBQ2pELGNBQWMsRUFBRSwyQ0FBMkM7WUFDM0QsV0FBVyxFQUFFO2NBQ1hDLGdDQUFnQyxFQUFFO2dCQUNoQyxTQUFTLEVBQUUsa0NBQWtDO2dCQUM3Q0MsTUFBTSxFQUFFLElBQUksQ0FBQ2xDLFFBQVE7Z0JBQ3JCRSxRQUFRLEVBQUUsSUFBSSxDQUFDQSxRQUFRO2dCQUN2QixHQUFHZSxjQUFjO2dCQUNqQixHQUFHO2tCQUFFSyxRQUFRLEVBQUV6QixNQUFNLENBQUNzQyxhQUFhLENBQUNsQixjQUFjLENBQUNLLFFBQVEsSUFBSSxDQUFDLENBQUM7Z0JBQUU7Y0FDckU7WUFDRjtVQUNGO1FBQ0YsQ0FBQyxDQUFDO1FBRUZHLEdBQUcsQ0FBQ1QsR0FBRyxDQUFDO1FBQ1I7QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO01BS0ksQ0FBQyxDQUFDO0lBRUo7O0lBRU9vQixZQUFZLENBQUNwQixHQUFVLEVBQUNELFFBQWlDLEdBQUlDLEdBQUc7TUFBQSxPQUFLQSxHQUFHO0lBQUEsR0FBQztNQUM3RSxNQUFNcUIsTUFBTSxHQUFHLElBQUlDLHdCQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7TUFDM0IsTUFBTUMsTUFBMkIsR0FBR0YsTUFBTSxDQUFDRyxLQUFLLENBQUN4QixHQUFHLENBQUM7TUFDckQsTUFBTXlCLFNBQVMsR0FBRyxJQUFJSCx3QkFBUyxDQUFDO1FBQzlCVCxnQkFBZ0IsRUFBRSxLQUFLO1FBQ3ZCYSxPQUFPLEVBQUU7VUFBQSxPQUFNLElBQUk7UUFBQTtRQUNuQkMsZUFBZSxFQUFFLEtBQUs7UUFDdEJDLG1CQUFtQixFQUFFLEtBQUs7UUFDMUJDLGFBQWEsRUFBRTtNQUNqQixDQUFDLENBQUM7TUFFRixNQUFNQyxHQUE2QixHQUFHTCxTQUFTLENBQUNELEtBQUssQ0FDbkR6QixRQUFRLENBQ053QixNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUNRLHdDQUF3QyxDQUFDQyxzQ0FBc0MsQ0FDckgsQ0FDRjtNQUVELE9BQU9GLEdBQUc7SUFFbEI7SUFHQSxPQUFlWCxhQUFhLENBQUNjLEtBQWEsRUFBVTtNQUNsRCxNQUFNdEIsT0FBTyxHQUFHLElBQUlDLHlCQUFVLENBQUM7UUFDN0JDLGdCQUFnQixFQUFFLEtBQUs7UUFDdkJDLGFBQWEsRUFBRSxRQUFRO1FBQ3ZCQyxpQkFBaUIsRUFBRSxJQUFJO1FBQ3ZCbUIseUJBQXlCLEVBQUU7TUFDN0IsQ0FBQyxDQUFDO01BQ0YsTUFBTWxDLEdBQUcsR0FBSSxVQUFTVyxPQUFPLENBQUNLLEtBQUssQ0FBQ2lCLEtBQUssQ0FBRSxVQUFTO01BQ3BELE9BQU9qQyxHQUFHO0lBQ1o7SUFFQSxPQUFjbUMsdUJBQXVCLENBQ25DdkMsR0FBVyxFQUNYRSxPQUFnQyxHQUFHLENBQUMsQ0FBQyxFQUNyQ0MsUUFBaUMsR0FBSXFDLENBQUM7TUFBQSxPQUFLQSxDQUFDLENBQUNDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUNBLE9BQU8sQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDO0lBQUEsR0FDNUU7TUFDWixNQUFNcEMsY0FBOEIsR0FBRztRQUNyQ0UsWUFBWSxFQUFFLENBQUM7UUFDZkQsY0FBYyxFQUFFLElBQUk7UUFDcEJFLE1BQU0sRUFBRSxDQUFDO1FBQ1RDLG9CQUFvQixFQUFFLGdCQUFnQjtRQUN0Q2lDLFVBQVUsRUFBRSx5QkFBeUI7UUFDckNoQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ1osR0FBR1I7TUFDTCxDQUFDO01BQ0QsT0FBTyxJQUFJVSxPQUFPLENBQUksQ0FBQ0MsR0FBRyxFQUFFQyxNQUFNLEtBQUs7UUFDckMsTUFBTUMsT0FBTyxHQUFHLElBQUlDLHlCQUFVLENBQUM7VUFDN0JDLGdCQUFnQixFQUFFLEtBQUs7VUFDdkJDLGFBQWEsRUFBRSxlQUFlO1VBQzlCQyxpQkFBaUIsRUFBRTtRQUNyQixDQUFDLENBQUM7UUFDRixNQUFNZixHQUFHLEdBQUdXLE9BQU8sQ0FBQ0ssS0FBSyxDQUFDO1VBQ3hCLGVBQWUsRUFBRTtZQUNmLGFBQWEsRUFBRSwyQ0FBMkM7WUFDMUQsYUFBYSxFQUFFLGtDQUFrQztZQUNqRCxjQUFjLEVBQUUsMkNBQTJDO1lBQzNELFdBQVcsRUFBRTtjQUNYdUIsd0JBQXdCLEVBQUU7Z0JBQ3hCLFNBQVMsRUFBRSxrQ0FBa0M7Z0JBQzdDckIsTUFBTSxFQUFFLHNCQUFzQjtnQkFDOUJoQyxRQUFRLEVBQUUsVUFBVTtnQkFDcEIsR0FBR2UsY0FBYztnQkFDakIsR0FBRztrQkFBRUssUUFBUSxFQUFFekIsTUFBTSxDQUFDc0MsYUFBYSxDQUFDbEIsY0FBYyxDQUFDSyxRQUFRLElBQUksQ0FBQyxDQUFDO2dCQUFFO2NBQ3JFO1lBQ0Y7VUFDRjtRQUNGLENBQUMsQ0FBQztRQUVGa0MsY0FBSyxDQUNGQyxJQUFJLENBQVM3QyxHQUFHLEVBQUVJLEdBQUcsRUFBRTtVQUFFMEMsT0FBTyxFQUFFO1lBQUUsY0FBYyxFQUFFO1VBQVc7UUFBRSxDQUFDLENBQUMsQ0FDbkVDLElBQUksQ0FBQyxDQUFDO1VBQUVDO1FBQWdCLENBQUMsS0FBSztVQUM3QixNQUFNdkIsTUFBTSxHQUFHLElBQUlDLHdCQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7VUFDaEMsTUFBTUMsTUFBMkIsR0FBR0YsTUFBTSxDQUFDRyxLQUFLLENBQUNvQixJQUFJLENBQUM7VUFDdEQsTUFBTW5CLFNBQVMsR0FBRyxJQUFJSCx3QkFBUyxDQUFDO1lBQUVULGdCQUFnQixFQUFFO1VBQU0sQ0FBQyxDQUFDO1VBRTVELE1BQU1pQixHQUFvQyxHQUFHTCxTQUFTLENBQUNELEtBQUssQ0FDMUR6QixRQUFRLENBQ053QixNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUNzQixnQ0FBZ0MsQ0FBQ0MsOEJBQThCLENBQ3JHLENBQ0Y7VUFFRCxJQUFJN0MsY0FBYyxDQUFDQyxjQUFjLElBQUksT0FBTzRCLEdBQUcsS0FBSyxRQUFRLElBQUksVUFBVSxJQUFJQSxHQUFHO1lBQy9FLE9BQU9wQixNQUFNLENBQUMsSUFBSXFDLHlCQUFnQixDQUFDakIsR0FBRyxDQUFDLENBQUM7VUFBQztVQUUzQ3JCLEdBQUcsQ0FBQ3FCLEdBQUcsQ0FBTTtRQUNmLENBQUMsQ0FBQyxDQUNEa0IsS0FBSyxDQUFDdEMsTUFBTSxDQUFDO01BQ2xCLENBQUMsQ0FBQztJQUNKO0VBQ0Y7RUFBQztBQUFBIn0=