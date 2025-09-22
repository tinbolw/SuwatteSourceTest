// // simple-login auth attempts
// import { NetworkClientBuilder, NetworkRequest } from "@suwatte/daisuke";

// import { parse, stringify } from "querystring";

// export async function getCookie(baseUrl: string, username: string, password: string) {

//   // const client2 = new NetworkClientBuilder()
//   //   .addRequestInterceptor(async (req: NetworkRequest) => {
//   //     console.log(req);
//   //     return {
//   //       ...req,
//   //       url: `${baseUrl}/login.html`,
//   //       body: stringify({user: username, pass: password}),
//   //       headers: {
//   //         "Content-Type": "application/x-www-form-urlencoded",
//   //         // "Cookie": "",
//   //       },
//   //       // cookies: [],
//   //     }
//   //   })
//   //   .build();

//   const client = new NetworkClient();

//   const response = await client.post(`${baseUrl}/login.html`, 
//     {
//       body: stringify({user: username, pass: password}),
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded",
//       },
//       // cookies: [],
//     }
//     // {
//     //   body: '-----011000010111000001101001\r\nContent-Disposition: form-data; name="user"\r\n\r\ntinbolw\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name="pass"\r\n\r\npassword\r\n-----011000010111000001101001--\r\n\r\n',
//     //   headers: {
//     //     "Content-Type": "multipart/form-data; boundary=---011000010111000001101001",
//     //   },
//     //   // cookies: [],
//     // }
//   );

//   console.log(response.request);
//   console.log(response.data);
//   console.log(response.data.includes("Invalid username or password"));
//   // console.log((response.headers));
//   // return JSON.parse(response.headers).headers["Set-Cookie"].match(/^(.*?)\;/)[1];
// }

// // // const testCookie = await this.client.request(
// //     //   {
// //     //     url: `${this.baseUrl}/login.html`,
// //     //     method: "POST",
// //     //     body: qs.stringify({ user: 'tinbolw', pass: 'password' }),
// //     //     headers: {
// //     //       "Content-Type": "application/x-www-form-urlencoded",
// //     //     }
// //     //   }
// //     // )

// //     // const parsed = JSON.parse(testCookie.data);
// //     // const cookie = testCookie.headers["Set-Cookie"].match(/^(.*?)\;/)[1];
// //     // const cookie = testCookie.headers["Set-Cookie"].match(/=([^;]*)/)[1];
// //     // console.log(cookie);

// //     const client2 = new NetworkClientBuilder()
// //       .addRequestInterceptor(async (req: NetworkRequest) => {
// //         return {
// //           ...req,
// //           body: {
// //             "query": GetAllMangaQuery,
// //           },
// //           headers: {
// //             // "authorization": `Basic ${genAuthHeader(
// //             //   await ObjectStore.string("suwayomi_username"), 
// //             //   await ObjectStore.string("suwayomi_password")
// //             // )}`,
// //             // "Cookie": cookie,
// //             "Content-Type": "application/json"
// //           },
// //           cookies: [{
// //             name: "JSESSIONID",
// //             value: "redacted"
// //           }]
// //         }
// //       })
// //       .build();

// //     // const response = await this.client.request(
// //     //   {
// //     //     url: this.apiUrl,
// //     //     method: "POST",
// //     //     body: {
// //     //       "query": GetAllMangaQuery,
// //     //     },
// //     //     headers: {
// //     //       // "authorization": `Basic ${genAuthHeader(
// //     //       //   await ObjectStore.string("suwayomi_username"), 
// //     //       //   await ObjectStore.string("suwayomi_password")
// //     //       // )}`,
// //     //       "Cookie": cookie,
// //     //       "Content-Type": "application/json"
// //     //     },
// //     //     // cookies: [{
// //     //     //   name: "Cookie",
// //     //     //   value: cookie
// //     //     // }]
// //     //   }
// //     // )