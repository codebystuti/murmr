import{l as a,$ as s,a0 as r}from"./index-CoL0mo5m.js";import{u as c}from"./useQuery-D55osTiK.js";/**
 * @license lucide-react v0.441.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const l=a("Zap",[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",key:"1xq2db"}]]),i={async list(e=60){await s(100);const t=localStorage.getItem(r.ACTIVITY);return(t?JSON.parse(t):[]).slice(0,e)}};function y(e=60){return c({queryKey:["activity",e],queryFn:()=>i.list(e),staleTime:0,refetchOnWindowFocus:!0})}export{l as Z,y as u};
