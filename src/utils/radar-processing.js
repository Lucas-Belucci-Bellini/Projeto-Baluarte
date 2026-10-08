import { RADAR } from './radar-protocol.js';
export function createMatrix(fill=0){return Array.from({length:RADAR.RANGE_BINS},()=>Array(RADAR.DOPPLER_BINS).fill(fill));}
export function magnitude(i,q){return Math.abs(i)+Math.abs(q);}
export function applyDcNotch(i,q,width=1){const a=i.map(r=>r.slice()),b=q.map(r=>r.slice());for(let r=0;r<64;r++)for(let d=0;d<32;d++)if(d<width||d>=32-width){a[r][d]=0;b[r][d]=0;}return{i:a,q:b};}
export function applyMti(i,q,enabled=true){if(!enabled)return{i:i.map(r=>r.slice()),q:q.map(r=>r.slice())};const a=createMatrix(),b=createMatrix();for(let r=1;r<64;r++)for(let d=0;d<32;d++){a[r][d]=i[r][d]-i[r-1][d];b[r][d]=q[r][d]-q[r-1][d];}return{i:a,q:b};}
export function cfar(i,q,{guard=1,train=4,alpha=2.5,enabled=true}={}){const det=createMatrix(0),mag=createMatrix(0);for(let r=0;r<64;r++)for(let d=0;d<32;d++){const v=magnitude(i[r][d],q[r][d]);mag[r][d]=v;if(!enabled)continue;let sum=0,count=0;for(let o=guard+1;o<=guard+train;o++)for(const rr of[r-o,r+o])if(rr>=0&&rr<64){sum+=magnitude(i[rr][d],q[rr][d]);count++;}det[r][d]=count&&v>(sum/count)*alpha?1:0;}return{detections:det,magnitude:mag,count:det.flat().reduce((a,b)=>a+b,0)};}
export function processFrame(frame,config={}){const m=applyMti(frame.i,frame.q,config.mti!==false),n=applyDcNotch(m.i,m.q,config.notch??1);return{...frame,...cfar(n.i,n.q,config),i:n.i,q:n.q};}
