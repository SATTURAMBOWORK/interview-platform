import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import usePageTitle from "../hooks/usePageTitle";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Eye, EyeOff, User, Lock, AlertCircle, Loader, Terminal, Code2, Rocket } from "lucide-react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContextValue";

// ── DSA Animation Components ───────────────────────────────────────────────

const FLOAT = { animate: { opacity: [0, 1, 1, 0], y: [20, 5, -15, -35] }, transition: { duration: 15, repeat: Infinity, ease: 'easeInOut', times: [0, 0.2, 0.867, 1] } };

// Bubble Sort
const SortingArray = ({ style = {} }) => {
  const init = [{ id:'a',val:5 },{ id:'b',val:2 },{ id:'c',val:8 },{ id:'d',val:1 },{ id:'e',val:9 },{ id:'f',val:3 }];
  const [items, setItems] = useState(init);
  const [cmp, setCmp]     = useState([]);
  const stepRef = useRef(0); const itemsRef = useRef(init);
  useEffect(() => {
    const swaps = [[0,1],[2,3],[4,5],[1,2],[3,4],[0,1],[2,3],[1,2],[3,4],[0,1],[2,3]];
    const id = setInterval(() => {
      const [i,j] = swaps[stepRef.current % swaps.length]; setCmp([i,j]);
      setTimeout(() => {
        const n = [...itemsRef.current];
        if (n[i].val > n[j].val) [n[i],n[j]] = [n[j],n[i]];
        itemsRef.current = n; setItems([...n]); setCmp([]);
        if (++stepRef.current >= swaps.length) { stepRef.current = 0; setTimeout(() => { itemsRef.current = init; setItems(init); }, 900); }
      }, 480);
    }, 1300);
    return () => clearInterval(id);
  }, []);
  return (
    <motion.div {...FLOAT} className="absolute flex flex-col items-start gap-1.5" style={style}>
      <p className="text-[8px] font-mono text-white/20 uppercase tracking-[0.2em]">bubble sort</p>
      <div className="flex gap-1">
        {items.map((item, i) => (
          <motion.div key={item.id} layout
            animate={{ backgroundColor: cmp.includes(i)?'rgba(139,92,246,0.45)':'rgba(6,182,212,0.12)', borderColor: cmp.includes(i)?'rgba(139,92,246,0.7)':'rgba(6,182,212,0.35)', scale: cmp.includes(i)?1.18:1, y: cmp.includes(i)?-5:0 }}
            transition={{ layout:{ type:'spring',stiffness:350,damping:28 }, default:{ duration:0.28 } }}
            className="w-8 h-8 border rounded-md flex items-center justify-center font-mono text-[11px] text-white/70"
          >{item.val}</motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Binary Search
const BinarySearchViz = ({ style = {} }) => {
  const arr = [1,3,5,7,9,11,13,15];
  const targets = [9,3,13,1,15,7];
  const [ptr, setPtr] = useState({ l:0,r:7,m:3,found:-1,ti:0 });
  const pRef = useRef({ l:0,r:7,m:3,found:-1,ti:0 });
  useEffect(() => {
    const id = setInterval(() => {
      const { l,r,m,found,ti } = pRef.current; const target = targets[ti]; let next;
      if (found !== -1 || l > r) {
        next = { l:0,r:7,m:3,found:-1,ti:(ti+1)%targets.length };
      } else {
        const nm = Math.floor((l+r)/2);
        if (arr[nm]===target) next = { l,r,m:nm,found:nm,ti };
        else if (arr[nm]<target) next = { l:nm+1,r,m:nm,found:-1,ti };
        else next = { l,r:nm-1,m:nm,found:-1,ti };
      }
      pRef.current = next; setPtr(next);
    }, 750);
    return () => clearInterval(id);
  }, []);
  return (
    <motion.div {...FLOAT} className="absolute flex flex-col items-start gap-1" style={style}>
      <p className="text-[8px] font-mono text-white/20 uppercase tracking-[0.2em]">binary search · {targets[ptr.ti]}</p>
      <div className="flex gap-1">
        {arr.map((val, i) => {
          const isFound=i===ptr.found, isMid=i===ptr.m&&ptr.found===-1, isOut=i<ptr.l||i>ptr.r;
          return (
            <div key={i} className="flex flex-col items-center">
              <motion.div
                animate={{ backgroundColor: isFound?'rgba(52,211,153,0.35)':isMid?'rgba(139,92,246,0.35)':isOut?'rgba(255,255,255,0.02)':'rgba(6,182,212,0.12)', borderColor: isFound?'rgba(52,211,153,0.8)':isMid?'rgba(139,92,246,0.8)':isOut?'rgba(255,255,255,0.08)':'rgba(6,182,212,0.35)', scale: (isMid||isFound)?1.15:1 }}
                transition={{ duration:0.3 }}
                className="w-7 h-7 border rounded flex items-center justify-center font-mono text-[10px] text-white/60"
              >{val}</motion.div>
              <div className="h-3 flex items-center justify-center text-[7px] font-mono">
                {isFound?<span className="text-emerald-400/70">✓</span>:i===ptr.l&&i===ptr.r?<span className="text-cyan-400/60">lr</span>:i===ptr.l?<span className="text-cyan-400/60">l</span>:i===ptr.r?<span className="text-cyan-400/60">r</span>:isMid?<span className="text-purple-400/60">m</span>:null}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

// Linked List
const LinkedListViz = ({ style = {} }) => {
  const pool = [3,7,1,9,5,2,8,4,6,0]; const headRef = useRef(0); const [head, setHead] = useState(0);
  useEffect(() => { const id = setInterval(() => { headRef.current=(headRef.current+1)%pool.length; setHead(headRef.current); },1800); return ()=>clearInterval(id); },[]);
  const visible = [0,1,2,3].map(i=>pool[(head+i)%pool.length]);
  return (
    <motion.div {...FLOAT} className="absolute flex flex-col items-start gap-1.5" style={style}>
      <p className="text-[8px] font-mono text-white/20 uppercase tracking-[0.2em]">linked list</p>
      <div className="flex items-center">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((val,i) => (
            <motion.div key={`${head}-${i}`} initial={{ opacity:0,x:32 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-32 }} transition={{ type:'spring',stiffness:320,damping:28 }} className="flex items-center">
              <div className="flex flex-col">
                <div className="w-9 h-6 border border-cyan-400/50 bg-white/[0.04] rounded-t-md flex items-center justify-center font-mono text-[11px] text-cyan-300">{val}</div>
                <div className="w-9 h-4 border-x border-b border-cyan-400/25 bg-white/[0.02] rounded-b-md flex items-center justify-center"><span className="text-[9px] text-cyan-400/40 font-mono">→</span></div>
              </div>
              {i<3 && <span className="text-cyan-400/40 font-mono text-xs px-0.5">→</span>}
            </motion.div>
          ))}
        </AnimatePresence>
        <span className="text-white/20 font-mono text-[10px] ml-1.5">null</span>
      </div>
    </motion.div>
  );
};

// Stack
const StackViz = ({ style = {} }) => {
  const pushPool = [5,8,1,9,3,6,4,7]; const [items,setItems]=useState([4,7,2]); const [label,setLabel]=useState('');
  const itemsRef=useRef([4,7,2]); const pushIdx=useRef(0);
  useEffect(() => {
    const id = setInterval(() => {
      const cur=itemsRef.current; let next,lbl;
      if(cur.length<5){const v=pushPool[pushIdx.current%pushPool.length];next=[...cur,v];lbl=`push(${v})`;pushIdx.current++;}
      else{const v=cur[cur.length-1];next=cur.slice(0,-1);lbl=`pop() → ${v}`;}
      itemsRef.current=next; setItems(next); setLabel(lbl); setTimeout(()=>setLabel(''),850);
    },1300);
    return ()=>clearInterval(id);
  },[]);
  return (
    <motion.div {...FLOAT} className="absolute flex flex-col items-center gap-1" style={style}>
      <AnimatePresence>{label&&<motion.p key={label} initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="text-[8px] font-mono text-purple-400 tracking-widest uppercase h-4">{label}</motion.p>}</AnimatePresence>
      {!label&&<div className="h-4"/>}
      <div className="w-16 border-x border-b border-cyan-400/30 rounded-b-lg p-1 flex flex-col-reverse gap-1 min-h-[90px]">
        <AnimatePresence initial={false}>
          {items.map((val,i)=>(
            <motion.div key={`${i}-${val}`} initial={{opacity:0,scaleY:0,y:-10}} animate={{opacity:1,scaleY:1,y:0}} exit={{opacity:0,scaleY:0,y:-10}} transition={{type:'spring',stiffness:400,damping:28}} className="h-6 bg-cyan-500/15 border border-cyan-400/40 rounded flex items-center justify-center font-mono text-[11px] text-cyan-300">{val}</motion.div>
          ))}
        </AnimatePresence>
      </div>
      <p className="text-[8px] font-mono text-white/20 uppercase tracking-[0.2em]">stack</p>
    </motion.div>
  );
};

// Binary Tree — pre-order traversal
const BinaryTreeViz = ({ style = {} }) => {
  const nodes = [{id:0,val:1,x:75,y:15},{id:1,val:2,x:40,y:50},{id:2,val:3,x:110,y:50},{id:3,val:4,x:20,y:85},{id:4,val:5,x:60,y:85},{id:5,val:6,x:90,y:85},{id:6,val:7,x:130,y:85}];
  const edges = [[75,15,40,50],[75,15,110,50],[40,50,20,85],[40,50,60,85],[110,50,90,85],[110,50,130,85]];
  const order = [0,1,3,4,2,5,6];
  const [step,setStep]=useState(0); const sRef=useRef(0);
  useEffect(()=>{ const id=setInterval(()=>{ sRef.current=(sRef.current+1)%(order.length+3); setStep(sRef.current); },700); return ()=>clearInterval(id); },[]);
  const curId = step<order.length?order[step]:-1;
  const visited = new Set(order.slice(0,step));
  return (
    <motion.div {...FLOAT} className="absolute flex flex-col items-start gap-1" style={style}>
      <p className="text-[8px] font-mono text-white/20 uppercase tracking-[0.2em]">pre-order traversal</p>
      <svg width="150" height="100">
        {edges.map(([x1,y1,x2,y2],i)=>(<motion.line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(6,182,212,0.3)" strokeWidth="1.5" animate={{opacity:[0.2,0.6,0.2]}} transition={{duration:3,repeat:Infinity,delay:i*0.15}}/>))}
        {nodes.map(n=>{
          const isCur=n.id===curId, isVis=visited.has(n.id);
          const stroke=isCur?'rgba(251,191,36,0.9)':isVis?'rgba(52,211,153,0.7)':'rgba(6,182,212,0.5)';
          return(<g key={n.id}><motion.circle cx={n.x} cy={n.y} r="11" fill="rgba(255,255,255,0.04)" stroke={stroke} strokeWidth="1.5" animate={{scale:isCur?[1,1.3,1]:1}} transition={{duration:0.4,repeat:isCur?Infinity:0}}/><text x={n.x} y={n.y+4} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.6)" fontFamily="monospace">{n.val}</text></g>);
        })}
      </svg>
    </motion.div>
  );
};

// BST — search animation
const BSTViz = ({ style = {} }) => {
  const nodes = [{id:0,val:8,x:75,y:15},{id:1,val:3,x:38,y:50},{id:2,val:12,x:112,y:50},{id:3,val:1,x:18,y:85},{id:4,val:6,x:58,y:85},{id:5,val:10,x:92,y:85},{id:6,val:15,x:132,y:85}];
  const edges = [[75,15,38,50],[75,15,112,50],[38,50,18,85],[38,50,58,85],[112,50,92,85],[112,50,132,85]];
  const searches = [{target:6,path:[0,1,4]},{target:10,path:[0,2,5]},{target:1,path:[0,1,3]},{target:15,path:[0,2,6]}];
  const [si,setSi]=useState(0); const [ps,setPs]=useState(0); const siRef=useRef(0); const psRef=useRef(0);
  useEffect(()=>{
    const id=setInterval(()=>{
      const max=searches[siRef.current].path.length+2; psRef.current++;
      if(psRef.current>=max){psRef.current=0;siRef.current=(siRef.current+1)%searches.length;}
      setSi(siRef.current); setPs(psRef.current);
    },800); return ()=>clearInterval(id);
  },[]);
  const s=searches[si]; const curId=ps<s.path.length?s.path[ps]:-1; const visited=new Set(s.path.slice(0,ps)); const foundId=ps>=s.path.length?s.path[s.path.length-1]:-1;
  return (
    <motion.div {...FLOAT} className="absolute flex flex-col items-start gap-1" style={style}>
      <p className="text-[8px] font-mono text-white/20 uppercase tracking-[0.2em]">BST search · {s.target}</p>
      <svg width="155" height="100">
        {edges.map(([x1,y1,x2,y2],i)=>(<motion.line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(6,182,212,0.3)" strokeWidth="1.5" animate={{opacity:[0.2,0.6,0.2]}} transition={{duration:2.5,repeat:Infinity,delay:i*0.2}}/>))}
        {nodes.map(n=>{
          const isCur=n.id===curId, isFound=n.id===foundId, isVis=visited.has(n.id);
          const stroke=isFound?'rgba(52,211,153,0.9)':isCur?'rgba(251,191,36,0.9)':isVis?'rgba(6,182,212,0.7)':'rgba(6,182,212,0.3)';
          return(<g key={n.id}><motion.circle cx={n.x} cy={n.y} r="12" fill="rgba(255,255,255,0.04)" stroke={stroke} strokeWidth="1.5" animate={{scale:isCur?[1,1.25,1]:1}} transition={{duration:0.4,repeat:isCur?Infinity:0}}/><text x={n.x} y={n.y+4} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.6)" fontFamily="monospace">{n.val}</text></g>);
        })}
      </svg>
    </motion.div>
  );
};

// Dijkstra
const DijkstraViz = ({ style = {} }) => {
  const nodes = [{id:0,label:'A',x:20,y:50},{id:1,label:'B',x:65,y:18},{id:2,label:'C',x:65,y:82},{id:3,label:'D',x:115,y:50},{id:4,label:'E',x:155,y:50}];
  const edges = [{f:0,t:1,w:4},{f:0,t:2,w:2},{f:1,t:2,w:1},{f:1,t:3,w:5},{f:2,t:3,w:8},{f:3,t:4,w:2}];
  const steps = [
    {cur:0,vis:[0],        dist:['0','4','2','∞','∞'],  ae:[0,1]},
    {cur:2,vis:[0,2],      dist:['0','3','2','10','∞'], ae:[2,4]},
    {cur:1,vis:[0,2,1],    dist:['0','3','2','8','∞'],  ae:[3]  },
    {cur:3,vis:[0,2,1,3],  dist:['0','3','2','8','10'], ae:[5]  },
    {cur:4,vis:[0,2,1,3,4],dist:['0','3','2','8','10'], ae:[]   },
  ];
  const [si,setSi]=useState(0); const siRef=useRef(0);
  useEffect(()=>{ const id=setInterval(()=>{ siRef.current=(siRef.current+1)%(steps.length+2); setSi(siRef.current); },1100); return ()=>clearInterval(id); },[]);
  const step=steps[Math.min(si,steps.length-1)];
  return (
    <motion.div {...FLOAT} className="absolute flex flex-col items-start gap-1" style={style}>
      <p className="text-[8px] font-mono text-white/20 uppercase tracking-[0.2em]">dijkstra · src: A</p>
      <svg width="175" height="110">
        {edges.map((e,i)=>{
          const fn=nodes[e.f],tn=nodes[e.t],isA=step.ae.includes(i);
          return(<g key={i}><motion.line x1={fn.x} y1={fn.y} x2={tn.x} y2={tn.y} stroke={isA?'rgba(251,191,36,0.8)':'rgba(6,182,212,0.3)'} strokeWidth={isA?2:1.5} animate={{opacity:isA?[0.6,1,0.6]:0.4}} transition={{duration:0.6,repeat:isA?Infinity:0}}/><text x={(fn.x+tn.x)/2} y={(fn.y+tn.y)/2-6} textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.3)" fontFamily="monospace">{e.w}</text></g>);
        })}
        {nodes.map((n,i)=>{
          const isCur=n.id===step.cur, isVis=step.vis.includes(n.id);
          const stroke=isCur?'rgba(251,191,36,0.9)':isVis?'rgba(52,211,153,0.7)':'rgba(6,182,212,0.4)';
          return(<g key={n.id}><motion.circle cx={n.x} cy={n.y} r="12" fill="rgba(255,255,255,0.04)" stroke={stroke} strokeWidth="1.5" animate={{scale:isCur?[1,1.2,1]:1}} transition={{duration:0.5,repeat:isCur?Infinity:0}}/><text x={n.x} y={n.y+4} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.7)" fontFamily="monospace">{n.label}</text><text x={n.x} y={n.y-16} textAnchor="middle" fontSize="7" fill="rgba(6,182,212,0.6)" fontFamily="monospace">{step.dist[i]}</text></g>);
        })}
      </svg>
    </motion.div>
  );
};

// Min Heap
const HeapViz = ({ style = {} }) => {
  const nodes = [{id:0,val:1,x:65,y:14},{id:1,val:3,x:32,y:48},{id:2,val:2,x:98,y:48},{id:3,val:7,x:14,y:82},{id:4,val:5,x:50,y:82},{id:5,val:6,x:83,y:82}];
  const edges = [[65,14,32,48],[65,14,98,48],[32,48,14,82],[32,48,50,82],[98,48,83,82]];
  const pairs = [[0,1],[0,2],[1,3],[1,4],[2,5]];
  const [pi,setPi]=useState(0); const piRef=useRef(0);
  useEffect(()=>{const id=setInterval(()=>{piRef.current=(piRef.current+1)%pairs.length;setPi(piRef.current);},900);return()=>clearInterval(id);},[]);
  const hl=new Set(pairs[pi]);
  return (
    <motion.div {...FLOAT} className="absolute flex flex-col items-start gap-1" style={style}>
      <p className="text-[8px] font-mono text-white/20 uppercase tracking-[0.2em]">min heap</p>
      <svg width="115" height="98">
        {edges.map(([x1,y1,x2,y2],i)=>(<motion.line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(6,182,212,0.3)" strokeWidth="1.5" animate={{opacity:[0.2,0.6,0.2]}} transition={{duration:2.5,repeat:Infinity,delay:i*0.15}}/>))}
        {nodes.map(n=>{const isHl=hl.has(n.id);return(<g key={n.id}><motion.circle cx={n.x} cy={n.y} r="11" fill="rgba(255,255,255,0.04)" stroke={isHl?'rgba(251,191,36,0.9)':'rgba(6,182,212,0.5)'} strokeWidth="1.5" animate={{scale:isHl?[1,1.25,1]:1}} transition={{duration:0.5,repeat:isHl?Infinity:0}}/><text x={n.x} y={n.y+4} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.6)" fontFamily="monospace">{n.val}</text></g>);})}
      </svg>
    </motion.div>
  );
};

// Sliding Window
const SlidingWindowViz = ({ style = {} }) => {
  const arr=[2,1,5,1,3,2,8,4]; const win=3;
  const [ws,setWs]=useState(0); const wsRef=useRef(0);
  useEffect(()=>{const id=setInterval(()=>{wsRef.current=(wsRef.current+1)%(arr.length-win+2);setWs(wsRef.current);},800);return()=>clearInterval(id);},[]);
  const w=Math.min(ws,arr.length-win);
  const sum=arr.slice(w,w+win).reduce((a,b)=>a+b,0);
  return (
    <motion.div {...FLOAT} className="absolute flex flex-col items-start gap-1.5" style={style}>
      <p className="text-[8px] font-mono text-white/20 uppercase tracking-[0.2em]">sliding window · sum={sum}</p>
      <div className="flex gap-1">
        {arr.map((val,i)=>{const inW=i>=w&&i<w+win;return(
          <motion.div key={i} animate={{backgroundColor:inW?'rgba(139,92,246,0.4)':'rgba(6,182,212,0.1)',borderColor:inW?'rgba(139,92,246,0.8)':'rgba(6,182,212,0.3)',scale:inW?1.1:1,y:inW?-3:0}} transition={{duration:0.3}} className="w-7 h-7 border rounded flex items-center justify-center font-mono text-[10px] text-white/60">{val}</motion.div>
        );})}
      </div>
    </motion.div>
  );
};

// Merge Sort
const _ml=[1,4,6,9],_mr=[2,3,7,8],_ms=[];
{let l=0,r=0,res=[];while(l<_ml.length||r<_mr.length){_ms.push({l,r,res:[...res]});if(l>=_ml.length){res.push(_mr[r]);r++;}else if(r>=_mr.length){res.push(_ml[l]);l++;}else if(_ml[l]<=_mr[r]){res.push(_ml[l]);l++;}else{res.push(_mr[r]);r++;}}_ms.push({l,r,res:[...res]});}
const MergeSortViz = ({ style = {} }) => {
  const [si,setSi]=useState(0); const siRef=useRef(0);
  useEffect(()=>{const id=setInterval(()=>{siRef.current=(siRef.current+1)%(_ms.length+2);setSi(siRef.current);},650);return()=>clearInterval(id);},[]);
  const s=_ms[Math.min(si,_ms.length-1)];
  const cell=(val,active,done)=><motion.div animate={{backgroundColor:active?'rgba(251,191,36,0.4)':done?'rgba(52,211,153,0.15)':'rgba(6,182,212,0.1)',borderColor:active?'rgba(251,191,36,0.8)':'rgba(6,182,212,0.3)'}} transition={{duration:0.3}} className="w-6 h-6 border rounded flex items-center justify-center font-mono text-[9px] text-white/60">{val}</motion.div>;
  return (
    <motion.div {...FLOAT} className="absolute flex flex-col items-start gap-1.5" style={style}>
      <p className="text-[8px] font-mono text-white/20 uppercase tracking-[0.2em]">merge sort</p>
      <div className="flex flex-col gap-1">
        <div className="flex gap-1">{_ml.map((v,i)=>cell(v,i===s.l,i<s.l))}<span className="text-white/20 font-mono text-[8px] self-center ml-1">L</span></div>
        <div className="flex gap-1">{_mr.map((v,i)=>cell(v,i===s.r,i<s.r))}<span className="text-white/20 font-mono text-[8px] self-center ml-1">R</span></div>
        <div className="flex gap-1">{[...Array(8)].map((_,i)=><motion.div key={i} animate={{backgroundColor:i<s.res.length?'rgba(52,211,153,0.3)':'rgba(255,255,255,0.03)',borderColor:i<s.res.length?'rgba(52,211,153,0.6)':'rgba(255,255,255,0.08)'}} transition={{duration:0.3}} className="w-6 h-6 border rounded flex items-center justify-center font-mono text-[9px] text-emerald-300/70">{s.res[i]??''}</motion.div>)}</div>
      </div>
    </motion.div>
  );
};

// Recursion Stack
const RecursionViz = ({ style = {} }) => {
  const frames=[{label:'fib(5)',d:0},{label:'fib(4)',d:1},{label:'fib(3)',d:2},{label:'fib(2)',d:3},{label:'fib(1)',d:4}];
  const [cnt,setCnt]=useState(1); const cRef=useRef(1);
  useEffect(()=>{const id=setInterval(()=>{cRef.current=cRef.current<frames.length?cRef.current+1:1;setCnt(cRef.current);},750);return()=>clearInterval(id);},[]);
  return (
    <motion.div {...FLOAT} className="absolute flex flex-col items-start gap-1" style={style}>
      <p className="text-[8px] font-mono text-white/20 uppercase tracking-[0.2em]">recursion stack</p>
      <div className="flex flex-col-reverse gap-1">
        <AnimatePresence initial={false}>
          {frames.slice(0,cnt).map((f,i)=>(
            <motion.div key={f.label} initial={{opacity:0,x:-16,scaleX:0.8}} animate={{opacity:1,x:0,scaleX:1}} exit={{opacity:0,x:-16}} transition={{type:'spring',stiffness:300,damping:25}} style={{marginLeft:`${f.d*5}px`}} className={`px-2 py-0.5 border rounded font-mono text-[10px] ${i===cnt-1?'border-amber-400/60 bg-amber-500/15 text-amber-300':'border-cyan-400/30 bg-cyan-500/10 text-cyan-300/70'}`}>{f.label}</motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Post-order traversal
const PostOrderViz = ({ style = {} }) => {
  const nodes=[{id:0,val:1,x:75,y:15},{id:1,val:2,x:40,y:50},{id:2,val:3,x:110,y:50},{id:3,val:4,x:20,y:85},{id:4,val:5,x:60,y:85},{id:5,val:6,x:90,y:85},{id:6,val:7,x:130,y:85}];
  const edges=[[75,15,40,50],[75,15,110,50],[40,50,20,85],[40,50,60,85],[110,50,90,85],[110,50,130,85]];
  const order=[3,4,1,5,6,2,0];
  const [step,setStep]=useState(0);const sRef=useRef(0);
  useEffect(()=>{const id=setInterval(()=>{sRef.current=(sRef.current+1)%(order.length+3);setStep(sRef.current);},700);return()=>clearInterval(id);},[]);
  const curId=step<order.length?order[step]:-1;const visited=new Set(order.slice(0,step));
  return (
    <motion.div {...FLOAT} className="absolute flex flex-col items-start gap-1" style={style}>
      <p className="text-[8px] font-mono text-white/20 uppercase tracking-[0.2em]">post-order</p>
      <svg width="150" height="100">
        {edges.map(([x1,y1,x2,y2],i)=>(<motion.line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(6,182,212,0.3)" strokeWidth="1.5" animate={{opacity:[0.2,0.6,0.2]}} transition={{duration:3,repeat:Infinity,delay:i*0.15}}/>))}
        {nodes.map(n=>{const iC=n.id===curId,iV=visited.has(n.id);const st=iC?'rgba(251,191,36,0.9)':iV?'rgba(52,211,153,0.7)':'rgba(6,182,212,0.5)';return(<g key={n.id}><motion.circle cx={n.x} cy={n.y} r="11" fill="rgba(255,255,255,0.04)" stroke={st} strokeWidth="1.5" animate={{scale:iC?[1,1.3,1]:1}} transition={{duration:0.4,repeat:iC?Infinity:0}}/><text x={n.x} y={n.y+4} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.6)" fontFamily="monospace">{n.val}</text></g>);})}
      </svg>
    </motion.div>
  );
};

// In-order traversal
const InOrderViz = ({ style = {} }) => {
  const nodes=[{id:0,val:1,x:75,y:15},{id:1,val:2,x:40,y:50},{id:2,val:3,x:110,y:50},{id:3,val:4,x:20,y:85},{id:4,val:5,x:60,y:85},{id:5,val:6,x:90,y:85},{id:6,val:7,x:130,y:85}];
  const edges=[[75,15,40,50],[75,15,110,50],[40,50,20,85],[40,50,60,85],[110,50,90,85],[110,50,130,85]];
  const order=[3,1,4,0,5,2,6];
  const [step,setStep]=useState(0);const sRef=useRef(0);
  useEffect(()=>{const id=setInterval(()=>{sRef.current=(sRef.current+1)%(order.length+3);setStep(sRef.current);},700);return()=>clearInterval(id);},[]);
  const curId=step<order.length?order[step]:-1;const visited=new Set(order.slice(0,step));
  return (
    <motion.div {...FLOAT} className="absolute flex flex-col items-start gap-1" style={style}>
      <p className="text-[8px] font-mono text-white/20 uppercase tracking-[0.2em]">in-order</p>
      <svg width="150" height="100">
        {edges.map(([x1,y1,x2,y2],i)=>(<motion.line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(6,182,212,0.3)" strokeWidth="1.5" animate={{opacity:[0.2,0.6,0.2]}} transition={{duration:3,repeat:Infinity,delay:i*0.15}}/>))}
        {nodes.map(n=>{const iC=n.id===curId,iV=visited.has(n.id);const st=iC?'rgba(251,191,36,0.9)':iV?'rgba(52,211,153,0.7)':'rgba(6,182,212,0.5)';return(<g key={n.id}><motion.circle cx={n.x} cy={n.y} r="11" fill="rgba(255,255,255,0.04)" stroke={st} strokeWidth="1.5" animate={{scale:iC?[1,1.3,1]:1}} transition={{duration:0.4,repeat:iC?Infinity:0}}/><text x={n.x} y={n.y+4} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.6)" fontFamily="monospace">{n.val}</text></g>);})}
      </svg>
    </motion.div>
  );
};

// Flood Fill
const _grid=[[0,0,0,1,0,0],[0,1,0,1,0,0],[0,1,0,0,0,1],[0,0,0,1,0,0],[0,0,0,0,0,0]];
const _fillOrder=[[2,2],[1,2],[3,2],[2,3],[0,2],[4,2],[3,1],[2,4],[0,1],[4,1],[4,3],[3,0],[1,4],[3,4],[0,0],[4,0],[4,4],[2,0],[0,4],[1,5],[3,5],[1,0],[4,5],[0,5]];
const FloodFillViz = ({ style = {} }) => {
  const [fc,setFc]=useState(0);const fcRef=useRef(0);
  useEffect(()=>{const id=setInterval(()=>{fcRef.current++;if(fcRef.current>_fillOrder.length+4)fcRef.current=0;setFc(fcRef.current);},180);return()=>clearInterval(id);},[]);
  const filled=new Set(_fillOrder.slice(0,fc).map(([r,c])=>`${r}-${c}`));
  return (
    <motion.div {...FLOAT} className="absolute flex flex-col items-start gap-1" style={style}>
      <p className="text-[8px] font-mono text-white/20 uppercase tracking-[0.2em]">flood fill</p>
      <div className="flex flex-col gap-0.5">
        {_grid.map((row,r)=>(
          <div key={r} className="flex gap-0.5">
            {row.map((cell,c)=>{const isW=cell===1,isF=filled.has(`${r}-${c}`),isSrc=r===2&&c===2;return(
              <motion.div key={c} animate={{backgroundColor:isW?'rgba(255,255,255,0.18)':isF?'rgba(52,211,153,0.4)':'rgba(6,182,212,0.07)',borderColor:isW?'rgba(255,255,255,0.25)':isF?'rgba(52,211,153,0.65)':'rgba(6,182,212,0.2)',scale:isSrc&&isF?[1,1.15,1]:1}} transition={{duration:0.25}} className="w-6 h-6 border rounded-sm"/>
            );})}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// OOP — Inheritance
const InheritanceViz = ({ style = {} }) => {
  const nodes = [
    { id:0, label:'Animal',  x:76, y:12 },
    { id:1, label:'Dog',     x:32, y:48 },
    { id:2, label:'Cat',     x:120,y:48 },
    { id:3, label:'Lab',     x:12, y:84 },
    { id:4, label:'Husky',   x:52, y:84 },
    { id:5, label:'Siamese', x:120,y:84 },
  ];
  const edges=[[76,22,32,40],[76,22,120,40],[32,58,12,76],[32,58,52,76],[120,58,120,76]];
  const chains=[[0,1,3],[0,1,4],[0,2,5],[0,1],[0,2]];
  const [ci,setCi]=useState(0);const cRef=useRef(0);
  useEffect(()=>{const id=setInterval(()=>{cRef.current=(cRef.current+1)%chains.length;setCi(cRef.current);},1100);return()=>clearInterval(id);},[]);
  const hl=new Set(chains[ci]);
  return (
    <motion.div {...FLOAT} className="absolute flex flex-col items-start gap-1" style={style}>
      <p className="text-[8px] font-mono text-white/20 uppercase tracking-[0.2em]">inheritance</p>
      <svg width="155" height="98">
        {edges.map(([x1,y1,x2,y2],i)=>(<motion.line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(6,182,212,0.35)" strokeWidth="1.5" strokeDasharray="3,2" animate={{opacity:[0.3,0.7,0.3]}} transition={{duration:2,repeat:Infinity,delay:i*0.2}}/>))}
        {nodes.map(n=>{const isHl=hl.has(n.id);return(<g key={n.id}><motion.rect x={n.x-22} y={n.y-8} width="44" height="16" rx="3" fill="rgba(255,255,255,0.04)" stroke={isHl?'rgba(34,211,238,0.9)':'rgba(6,182,212,0.35)'} strokeWidth="1.5" animate={{opacity:isHl?1:0.45}} transition={{duration:0.3}}/><text x={n.x} y={n.y+4} textAnchor="middle" fontSize="7" fill={isHl?"rgba(255,255,255,0.85)":"rgba(255,255,255,0.45)"} fontFamily="monospace">{n.label}</text></g>);})}
      </svg>
    </motion.div>
  );
};

// OOP — Polymorphism
const PolymorphismViz = ({ style = {} }) => {
  const objs=[{name:'Circle',method:'area()',result:'π·r²',c:'rgba(34,211,238,0.8)'},{name:'Rect',method:'area()',result:'w × h',c:'rgba(139,92,246,0.8)'},{name:'Triangle',method:'area()',result:'½·b·h',c:'rgba(52,211,153,0.8)'}];
  const [ai,setAi]=useState(0);const aRef=useRef(0);
  useEffect(()=>{const id=setInterval(()=>{aRef.current=(aRef.current+1)%objs.length;setAi(aRef.current);},1100);return()=>clearInterval(id);},[]);
  return (
    <motion.div {...FLOAT} className="absolute flex flex-col items-start gap-1.5" style={style}>
      <p className="text-[8px] font-mono text-white/20 uppercase tracking-[0.2em]">polymorphism</p>
      <div className="flex flex-col gap-1">
        {objs.map((o,i)=>{const isA=i===ai;return(
          <motion.div key={i} animate={{borderColor:isA?o.c:'rgba(6,182,212,0.2)',backgroundColor:isA?'rgba(255,255,255,0.05)':'rgba(255,255,255,0.02)',scale:isA?1.04:1}} transition={{duration:0.3}} className="flex items-center gap-1.5 px-2 py-1 border rounded-lg font-mono text-[9px]">
            <span className="text-white/50">{o.name}</span><span className="text-white/20">·</span>
            <span className="text-cyan-400/70">{o.method}</span>
            {isA&&<motion.span initial={{opacity:0,x:-4}} animate={{opacity:1,x:0}} style={{color:o.c}} className="ml-1">→ {o.result}</motion.span>}
          </motion.div>
        );})}
      </div>
    </motion.div>
  );
};

// OOP — Abstraction
const AbstractionViz = ({ style = {} }) => {
  const pub=['+ drive()','+ brake()','+ refuel()'];
  const priv=['- combustion()','- fuelFlow()','- ignite()'];
  const [show,setShow]=useState(false);const sRef=useRef(false);
  useEffect(()=>{const id=setInterval(()=>{sRef.current=!sRef.current;setShow(sRef.current);},1800);return()=>clearInterval(id);},[]);
  return (
    <motion.div {...FLOAT} className="absolute flex flex-col items-start gap-1" style={style}>
      <p className="text-[8px] font-mono text-white/20 uppercase tracking-[0.2em]">abstraction</p>
      <div className="border border-cyan-400/30 rounded-lg overflow-hidden w-32">
        <div className="bg-cyan-500/10 px-2 py-0.5 font-mono text-[8px] text-cyan-300/80 border-b border-cyan-400/20 text-center">class Car</div>
        <div className="px-2 py-1 flex flex-col gap-0.5">
          {pub.map((m,i)=><div key={i} className="text-[8px] font-mono text-emerald-400/70">{m}</div>)}
          <div className="border-t border-white/10 my-0.5"/>
          {priv.map((m,i)=><motion.div key={i} animate={{opacity:show?0.7:0.15}} transition={{duration:0.5}} className="text-[8px] font-mono text-rose-400/60">{m}</motion.div>)}
          {!show&&<div className="text-[7px] font-mono text-white/20 text-center">hidden impl</div>}
        </div>
      </div>
    </motion.div>
  );
};

// Networks — TCP Handshake
const TCPHandshakeViz = ({ style = {} }) => {
  const steps=[{label:'SYN →',c:'rgba(34,211,238,0.85)'},{label:'← SYN-ACK',c:'rgba(139,92,246,0.85)'},{label:'ACK →',c:'rgba(52,211,153,0.85)'},{label:'✓ CONNECTED',c:'rgba(52,211,153,0.9)'}];
  const [si,setSi]=useState(0);const siRef=useRef(0);
  useEffect(()=>{const id=setInterval(()=>{siRef.current=(siRef.current+1)%(steps.length+3);setSi(siRef.current);},850);return()=>clearInterval(id);},[]);
  const vis=steps.slice(0,Math.min(si,steps.length));
  return (
    <motion.div {...FLOAT} className="absolute flex flex-col items-start gap-1.5" style={style}>
      <p className="text-[8px] font-mono text-white/20 uppercase tracking-[0.2em]">TCP handshake</p>
      <div className="flex gap-2 items-start">
        <div className="flex flex-col items-center gap-1"><div className="px-2 py-0.5 border border-cyan-400/40 rounded font-mono text-[8px] text-cyan-300/70">Client</div><div className="w-px bg-cyan-400/15" style={{height:64}}/></div>
        <div className="flex flex-col gap-1 pt-5 min-w-[72px]">
          <AnimatePresence>{vis.map((s,i)=><motion.div key={i} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} className="font-mono text-[8px] text-center" style={{color:s.c}}>{s.label}</motion.div>)}</AnimatePresence>
        </div>
        <div className="flex flex-col items-center gap-1"><div className="px-2 py-0.5 border border-cyan-400/40 rounded font-mono text-[8px] text-cyan-300/70">Server</div><div className="w-px bg-cyan-400/15" style={{height:64}}/></div>
      </div>
    </motion.div>
  );
};

// Networks — OSI Layers
const OSILayerViz = ({ style = {} }) => {
  const layers=[{n:'Application',c:'rgba(34,211,238,0.75)'},{n:'Transport',c:'rgba(139,92,246,0.75)'},{n:'Network',c:'rgba(236,72,153,0.75)'},{n:'Data Link',c:'rgba(251,191,36,0.75)'},{n:'Physical',c:'rgba(52,211,153,0.75)'}];
  const [ai,setAi]=useState(0);const aRef=useRef(0);
  useEffect(()=>{const id=setInterval(()=>{aRef.current=(aRef.current+1)%(layers.length*2+3);setAi(aRef.current);},550);return()=>clearInterval(id);},[]);
  const half=layers.length;const aIdx=ai<half?ai:ai<half*2?(half*2-1-ai):-1;
  return (
    <motion.div {...FLOAT} className="absolute flex flex-col items-start gap-1" style={style}>
      <p className="text-[8px] font-mono text-white/20 uppercase tracking-[0.2em]">OSI model</p>
      <div className="flex flex-col gap-0.5">
        {layers.map((l,i)=>{const isA=i===aIdx;return(
          <motion.div key={i} animate={{backgroundColor:isA?l.c.replace('0.75','0.18'):'rgba(255,255,255,0.03)',borderColor:isA?l.c:'rgba(6,182,212,0.2)',scale:isA?1.05:1}} transition={{duration:0.22}} className="px-3 py-0.5 border rounded font-mono text-[8px] text-white/55 w-28 text-center">{l.n}</motion.div>
        );})}
      </div>
    </motion.div>
  );
};

// DBMS — SQL JOIN
const SQLJoinViz = ({ style = {} }) => {
  const users=[{id:1,n:'Alice'},{id:2,n:'Bob'},{id:3,n:'Carol'}];
  const orders=[{uid:1,item:'Book'},{uid:2,item:'Pen'},{uid:1,item:'Cup'}];
  const matches=[[0,0],[1,1],[0,2]];
  const [mi,setMi]=useState(0);const mRef=useRef(0);
  useEffect(()=>{const id=setInterval(()=>{mRef.current=(mRef.current+1)%matches.length;setMi(mRef.current);},1100);return()=>clearInterval(id);},[]);
  const [ui,oi]=matches[mi];
  return (
    <motion.div {...FLOAT} className="absolute flex flex-col items-start gap-1.5" style={style}>
      <p className="text-[8px] font-mono text-white/20 uppercase tracking-[0.2em]">SQL JOIN</p>
      <div className="flex gap-2 items-center">
        <div className="flex flex-col gap-0.5">
          <div className="text-[7px] font-mono text-cyan-400/40 uppercase px-1">Users</div>
          {users.map((u,i)=><motion.div key={i} animate={{backgroundColor:i===ui?'rgba(34,211,238,0.18)':'rgba(255,255,255,0.03)',borderColor:i===ui?'rgba(34,211,238,0.6)':'rgba(255,255,255,0.1)'}} transition={{duration:0.3}} className="px-2 py-0.5 border rounded font-mono text-[8px] text-white/55">{u.id} · {u.n}</motion.div>)}
        </div>
        <span className="text-cyan-400/40 font-mono text-sm pb-1">⋈</span>
        <div className="flex flex-col gap-0.5">
          <div className="text-[7px] font-mono text-purple-400/40 uppercase px-1">Orders</div>
          {orders.map((o,i)=><motion.div key={i} animate={{backgroundColor:i===oi?'rgba(139,92,246,0.18)':'rgba(255,255,255,0.03)',borderColor:i===oi?'rgba(139,92,246,0.6)':'rgba(255,255,255,0.1)'}} transition={{duration:0.3}} className="px-2 py-0.5 border rounded font-mono text-[8px] text-white/55">{o.uid} · {o.item}</motion.div>)}
        </div>
      </div>
    </motion.div>
  );
};

// DBMS — Transaction
const TransactionViz = ({ style = {} }) => {
  const ops=[{t:'BEGIN',c:'rgba(34,211,238,0.8)'},{t:'UPDATE users',c:'rgba(255,255,255,0.5)'},{t:'INSERT logs',c:'rgba(255,255,255,0.5)'},{t:'SELECT count',c:'rgba(255,255,255,0.5)'},{t:'COMMIT ✓',c:'rgba(52,211,153,0.85)'}];
  const [cnt,setCnt]=useState(0);const cRef=useRef(0);
  useEffect(()=>{const id=setInterval(()=>{cRef.current=cRef.current<ops.length?cRef.current+1:0;setCnt(cRef.current);},700);return()=>clearInterval(id);},[]);
  return (
    <motion.div {...FLOAT} className="absolute flex flex-col items-start gap-1" style={style}>
      <p className="text-[8px] font-mono text-white/20 uppercase tracking-[0.2em]">transaction</p>
      <div className="flex flex-col gap-0.5">
        <AnimatePresence initial={false}>
          {ops.slice(0,cnt).map((op,i)=>(
            <motion.div key={op.t} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} exit={{opacity:0}} transition={{type:'spring',stiffness:300,damping:25}} className="px-2 py-0.5 border rounded font-mono text-[9px]" style={{color:op.c,borderColor:i===cnt-1?op.c:'rgba(255,255,255,0.08)',backgroundColor:i===cnt-1?'rgba(255,255,255,0.04)':'transparent'}}>{op.t}</motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Scene Manager — shows 3 random animations at random positions, rotates every 10s
const ALL_TYPES = ['SortingArray','BinarySearch','LinkedList','Stack','BinaryTree','BST','Dijkstra','Heap','SlidingWindow','MergeSort','Recursion','PostOrder','InOrder','FloodFill','Inheritance','Polymorphism','Abstraction','TCPHandshake','OSILayer','SQLJoin','Transaction'];
const COMP_MAP  = { SortingArray, BinarySearch:BinarySearchViz, LinkedList:LinkedListViz, Stack:StackViz, BinaryTree:BinaryTreeViz, BST:BSTViz, Dijkstra:DijkstraViz, Heap:HeapViz, SlidingWindow:SlidingWindowViz, MergeSort:MergeSortViz, Recursion:RecursionViz, PostOrder:PostOrderViz, InOrder:InOrderViz, FloodFill:FloodFillViz, Inheritance:InheritanceViz, Polymorphism:PolymorphismViz, Abstraction:AbstractionViz, TCPHandshake:TCPHandshakeViz, OSILayer:OSILayerViz, SQLJoin:SQLJoinViz, Transaction:TransactionViz };
const ZONES = [{ top:'4%',left:'3%' },{ top:'4%',right:'2%' },{ bottom:'3%',left:'3%' },{ bottom:'3%',right:'2%' }];
const pickRand = (arr, exclude=[]) => { const p=arr.filter(x=>!exclude.includes(x)); return p[Math.floor(Math.random()*p.length)]; };

const DSAAnimationScene = () => {
  const init = () => {
    const types = [...ALL_TYPES].sort(()=>Math.random()-0.5);
    const zones = [...ZONES].sort(()=>Math.random()-0.5);
    return [0,1,2,3].map(i=>({ id:i*100, type:types[i], pos:zones[i] }));
  };
  const [slots,setSlots] = useState(init);
  const cntRef = useRef(300);
  useEffect(()=>{
    const id = setInterval(()=>{
      setSlots(prev=>{
        const idx = Math.floor(Math.random()*prev.length);
        const usedT = prev.filter((_,i)=>i!==idx).map(s=>s.type);
        const usedZ = prev.filter((_,i)=>i!==idx).map(s=>JSON.stringify(s.pos));
        const newType = pickRand(ALL_TYPES, usedT);
        const avail   = ZONES.filter(z=>!usedZ.includes(JSON.stringify(z)));
        const newPos  = avail[Math.floor(Math.random()*avail.length)];
        const next = [...prev];
        next[idx] = { id:cntRef.current++, type:newType, pos:newPos };
        return next;
      });
    }, 15000);
    return ()=>clearInterval(id);
  },[]);
  return <>{slots.map(({id,type,pos})=>{ const C=COMP_MAP[type]; return <C key={id} style={pos}/>; })}</>;
};

// ──────────────────────────────────────────────────────────────────────────────

function Login() {
  usePageTitle("Login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // Mouse tracking for 3D effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-300, 300], [5, -5]);
  const rotateY = useTransform(mouseX, [-300, 300], [-5, 5]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/login", {
        username,
        password,
      });

      const token = res.data.token;
      const role = res.data.user?.role?.toLowerCase();

      if (!token || !role) {
        throw new Error("Invalid login response");
      }

      login(token, role);

      if (role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Invalid username or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="h-screen overflow-hidden bg-[#0a0a16] text-slate-300 relative">
      
      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 -z-20 bg-[#0a0a16]"></div>
      <div className="fixed inset-0 -z-10 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full filter blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600 rounded-full filter blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-600 rounded-full filter blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* GRID OVERLAY - Lighter */}
      <div className="fixed inset-0 -z-10 opacity-[0.15]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Full-page floating DSA symbols — fixed layer between background and content */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 5 }}>
        {[
          // bottom → middle (spread full width)
          { symbol: 'O(1)',     left: '4%',  bottom: '2%',  y: -180, color: 'rgba(34,211,238,0.7)',   delay: 0   },
          { symbol: 'O(n²)',    left: '18%', bottom: '2%',  y: -180, color: 'rgba(167,139,250,0.7)',  delay: 0.7 },
          { symbol: '[ ]',      left: '34%', bottom: '2%',  y: -180, color: 'rgba(244,114,182,0.7)',  delay: 0.3 },
          { symbol: 'BFS',      left: '50%', bottom: '2%',  y: -180, color: 'rgba(52,211,153,0.7)',   delay: 1.7 },
          { symbol: '→',        left: '64%', bottom: '2%',  y: -180, color: 'rgba(34,211,238,0.4)',   delay: 0.9 },
          { symbol: 'pop()',    left: '80%', bottom: '2%',  y: -180, color: 'rgba(251,113,133,0.7)',  delay: 1.6 },
          { symbol: 'O(n)',     left: '90%', bottom: '2%',  y: -180, color: 'rgba(34,211,238,0.6)',   delay: 2.2 },
          // middle → top (spread full width)
          { symbol: 'O(log n)', left: '10%', bottom: '48%', y: -180, color: 'rgba(103,232,249,0.7)',  delay: 1.4 },
          { symbol: '{ }',      left: '26%', bottom: '48%', y: -180, color: 'rgba(96,165,250,0.7)',   delay: 1.0 },
          { symbol: 'DFS',      left: '42%', bottom: '48%', y: -180, color: 'rgba(167,139,250,0.7)',  delay: 0.5 },
          { symbol: 'DP',       left: '56%', bottom: '48%', y: -180, color: 'rgba(34,211,238,0.7)',   delay: 1.2 },
          { symbol: 'null',     left: '70%', bottom: '48%', y: -180, color: 'rgba(255,255,255,0.25)', delay: 2.0 },
          { symbol: 'push()',   left: '84%', bottom: '48%', y: -180, color: 'rgba(167,139,250,0.7)',  delay: 2.4 },
          { symbol: 'O(1)',     left: '96%', bottom: '48%', y: -180, color: 'rgba(34,211,238,0.5)',   delay: 0.2 },
        ].map((item, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 1, 1, 0], y: item.y }}
            transition={{ duration: 4.5, repeat: Infinity, delay: item.delay, ease: 'easeOut' }}
            className="absolute font-mono text-xs font-bold"
            style={{ left: item.left, bottom: item.bottom, color: item.color }}
          >
            {item.symbol}
          </motion.span>
        ))}
      </div>

      <div className="h-screen flex flex-col lg:flex-row relative z-10">
        
        {/* LEFT SIDE - INTERACTIVE HERO SECTION */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => {
            mouseX.set(0);
            mouseY.set(0);
          }}
        >
          
          {/* DSA scene — behind content (z-0) */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <DSAAnimationScene />
          </div>


          {/* Content */}
          <motion.div
            style={{ rotateX, rotateY, transformPerspective: 1000 }}
            className="relative z-10 max-w-xl"
          >
            
            {/* Logo/Brand */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-5"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-3 cursor-pointer"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                >
                  <Code2 className="w-6 h-6 text-white" />
                </motion.div>
                <span className="text-2xl font-black tracking-tight">
                  <span className="text-white">Interview</span>
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Prep</span>
                </span>
              </motion.div>

              <motion.h1
                whileHover={{ scale: 1.02 }}
                className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-tight uppercase cursor-default"
              >
                Initialize <br />
                <motion.span
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                  style={{ backgroundSize: "200% 200%" }}
                >
                  Your Journey
                </motion.span>
              </motion.h1>

              <p className="text-lg text-slate-400 leading-relaxed max-w-md">
                Elite training ground for algorithmic mastery. Let's make you interview-ready! 🚀
              </p>
            </motion.div>


            {/* Motivational Code Snippet - Option 2 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              whileHover={{ scale: 1.02 }}
              className="mt-6 p-5 rounded-2xl bg-black/40 border border-cyan-400/20 backdrop-blur-sm font-mono text-sm cursor-pointer group"
            >
              <div className="flex items-center gap-2 mb-3">
                <motion.div whileHover={{ scale: 1.2 }} className="w-3 h-3 rounded-full bg-red-500 cursor-pointer" />
                <motion.div whileHover={{ scale: 1.2 }} className="w-3 h-3 rounded-full bg-yellow-500 cursor-pointer" />
                <motion.div whileHover={{ scale: 1.2 }} className="w-3 h-3 rounded-full bg-green-500 cursor-pointer" />
                
                <motion.div
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="ml-auto"
                >
                  <Rocket className="w-4 h-4 text-cyan-400" />
                </motion.div>
              </div>
              
              <div className="space-y-1 text-slate-400 text-xs">
                <motion.p whileHover={{ x: 5, color: "#22d3ee" }} transition={{ duration: 0.2 }}>
                  <span className="text-purple-400">const</span> <span className="text-cyan-400">journey</span> = <span className="text-green-400">await</span> <span className="text-blue-400">startLearning</span>();
                </motion.p>
                <motion.p whileHover={{ x: 5, color: "#22d3ee" }} transition={{ duration: 0.2 }}>
                  <span className="text-purple-400">if</span> (journey.<span className="text-yellow-400">isConsistent</span>) &#123;
                </motion.p>
                <motion.p whileHover={{ x: 10, color: "#22d3ee" }} transition={{ duration: 0.2 }} className="pl-3">
                  dreams.<span className="text-pink-400">become</span>(reality);
                </motion.p>
                <motion.p whileHover={{ x: 10, color: "#22d3ee" }} transition={{ duration: 0.2 }} className="pl-3">
                  success.<span className="text-orange-400">find</span>(you);
                </motion.p>
                <motion.p whileHover={{ x: 5, color: "#22d3ee" }} transition={{ duration: 0.2 }}>
                  &#125;
                </motion.p>
              </div>

              {/* Typing cursor */}
              <motion.div
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-1.5 h-3 bg-cyan-400 ml-1"
              />
            </motion.div>

          </motion.div>
        </motion.div>

        {/* RIGHT SIDE - LOGIN FORM */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-8 lg:py-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-md"
          >
            
            {/* CARD */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="relative group"
            >
              {/* Glow effect on hover */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>

              <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
                
                {/* HEADER */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-center space-y-2 mb-6"
                >
                  <motion.div
                    animate={{ 
                      textShadow: [
                        "0 0 20px rgba(6, 182, 212, 0.5)",
                        "0 0 30px rgba(6, 182, 212, 0.8)",
                        "0 0 20px rgba(6, 182, 212, 0.5)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-3xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent tracking-tight"
                  >
                    <span className="flex items-center gap-2 justify-center">
                      <Code2 className="w-7 h-7 text-cyan-400" />
                      <span>Interview<span className="text-white">Prep</span></span>
                    </span>
                  </motion.div>
                  
                </motion.div>

                {/* ERROR MESSAGE */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="mb-5 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2 backdrop-blur-sm"
                  >
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-300 font-medium">{error}</p>
                  </motion.div>
                )}

                {/* FORM */}
                <form onSubmit={handleLogin} className="space-y-5">
                  
                  {/* USERNAME */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <label className="block text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2 font-mono">
                      Username
                    </label>
                    <div className="relative group/input">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within/input:text-cyan-400 transition-colors" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="enter_username"
                        required
                        className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 text-white placeholder:text-slate-500 font-mono text-sm"
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/0 via-cyan-400/5 to-cyan-400/0 opacity-0 group-focus-within/input:opacity-100 transition-opacity pointer-events-none"></div>
                    </div>
                  </motion.div>

                  {/* PASSWORD */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <label className="block text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2 font-mono">
                      Password
                    </label>
                    <div className="relative group/input">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within/input:text-cyan-400 transition-colors" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 text-white placeholder:text-slate-500 font-mono text-sm"
                      />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </motion.button>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/0 via-cyan-400/5 to-cyan-400/0 opacity-0 group-focus-within/input:opacity-100 transition-opacity pointer-events-none"></div>
                    </div>
                  </motion.div>

                  {/* SUBMIT BUTTON */}
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full relative group/btn overflow-hidden rounded-xl py-3 font-bold text-white mt-6 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 group-hover/btn:from-cyan-500 group-hover/btn:via-blue-500 group-hover/btn:to-purple-500 transition-all duration-300"></div>
                    <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 blur-xl transition-opacity duration-300"></div>
                    
                    <div className="relative flex items-center justify-center gap-2 uppercase tracking-wider font-mono text-sm">
                      {loading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Loader className="w-4 h-4" />
                          </motion.div>
                          <span>Authenticating...</span>
                        </>
                      ) : (
                        <>
                          <Terminal className="w-4 h-4" />
                          <span>Initialize Access</span>
                        </>
                      )}
                    </div>
                  </motion.button>
                </form>

                {/* DIVIDER */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="relative my-6"
                >
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-[#0a0a16] text-slate-500 uppercase tracking-wider font-mono">or</span>
                  </div>
                </motion.div>

                {/* REGISTER LINK */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="text-center"
                >
                  <p className="text-slate-400 font-mono text-xs">
                    New recruit?{" "}
                    <Link
                      to="/register"
                      className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors underline-offset-4 hover:underline"
                    >
                      Register Now →
                    </Link>
                  </p>
                </motion.div>

                {/* FOOTER */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-6 pt-5 border-t border-white/5"
                >
                  <p className="text-[10px] text-slate-500 text-center leading-relaxed font-mono">
                    © 2025 InterviewPrep · Secure Terminal v2.0
                  </p>
                </motion.div>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </div>

    </div>
  );
}

export default Login;