import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';

// ============================================================
// BACKEND.IO — Admin Dashboard
// ============================================================

// --- API helper ---
async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  return res.json();
}

// --- ICONS ---
const I = {
  Mail: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Pkg: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  Dollar: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  Box: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>,
  Trend: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Layout: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>,
  Truck: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  Send: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Gear: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  Home: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Warn: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Check: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
  Sync: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>,
  Ext: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
};

// --- UI COMPONENTS ---
const Badge = ({ children, v = 'default' }) => {
  const c = { default:'#1a1a2e;#a8b2d1', success:'#0d3320;#34d399', warning:'#3d2e0a;#fbbf24', danger:'#3b1020;#f87171', info:'#0c2d48;#60a5fa', purple:'#2d1b4e;#a78bfa' };
  const [bg, fg] = (c[v]||c.default).split(';');
  return <span style={{padding:'3px 10px',borderRadius:6,fontSize:11,fontWeight:600,letterSpacing:'0.3px',textTransform:'uppercase',background:bg,color:fg,display:'inline-block'}}>{children}</span>;
};

const StatusBadge = ({status}) => {
  const m = {unfulfilled:['Unfulfilled','warning'],shipped:['Shipped','info'],delivered:['Delivered','success'],at_post_office:['At Post Office','purple'],cancelled:['Cancelled','danger']};
  const [l,v] = m[status]||['Unknown','default'];
  return <Badge v={v}>{l}</Badge>;
};

const Btn = ({children, v='primary', onClick, s='md', disabled}) => {
  const base = {border:'none',borderRadius:10,fontWeight:600,cursor:disabled?'not-allowed':'pointer',display:'inline-flex',alignItems:'center',gap:6,fontFamily:'inherit',transition:'all 0.15s',opacity:disabled?0.5:1};
  const sz = {sm:{padding:'6px 12px',fontSize:12},md:{padding:'10px 18px',fontSize:13}};
  const vs = {primary:{background:'#6366f1',color:'#fff'},secondary:{background:'#22223a',color:'#a8b2d1'},danger:{background:'#3b102020',color:'#f87171',border:'1px solid #f8717130'},success:{background:'#059669',color:'#fff'},ghost:{background:'transparent',color:'#a8b2d1'}};
  return <button onClick={disabled?undefined:onClick} style={{...base,...sz[s],...vs[v]}}>{children}</button>;
};

const Card = ({children, style={}}) => <div style={{background:'#161625',border:'1px solid #22223a',borderRadius:14,padding:24,...style}}>{children}</div>;

const Stat = ({icon:Icon,label,value,sub,color='#6366f1'}) => (
  <Card style={{display:'flex',flexDirection:'column',gap:12}}>
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
      <span style={{color:'#64748b',fontSize:12,fontWeight:600,letterSpacing:'0.5px',textTransform:'uppercase'}}>{label}</span>
      <div style={{width:36,height:36,borderRadius:10,background:`${color}18`,display:'flex',alignItems:'center',justifyContent:'center',color}}><Icon/></div>
    </div>
    <div style={{fontSize:28,fontWeight:700,color:'#e2e8f0',letterSpacing:'-0.5px'}}>{value}</div>
    {sub && <div style={{fontSize:12,color:'#64748b'}}>{sub}</div>}
  </Card>
);

// ============================================================
// PAGES
// ============================================================

// --- DASHBOARD ---
function DashboardPage({orders, products, profit}) {
  const rev = profit.reduce((a,b)=>a+(b.revenue||0),0);
  const prof = profit.reduce((a,b)=>a+(b.profit||0),0);
  const unf = orders.filter(o=>o.status==='unfulfilled').length;
  const low = products.filter(p=>p.stock<10).length;
  return (
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div><h2 style={{fontSize:22,fontWeight:700,color:'#e2e8f0',margin:0}}>Dashboard</h2><p style={{color:'#64748b',fontSize:13,marginTop:4}}>Overview of your store</p></div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16}}>
        <Stat icon={I.Dollar} label="Revenue" value={`€${(rev/1000).toFixed(1)}k`} sub="Last 6 months" color="#34d399"/>
        <Stat icon={I.Trend} label="Profit" value={`€${(prof/1000).toFixed(1)}k`} sub={rev?`${((prof/rev)*100).toFixed(1)}% margin`:''} color="#6366f1"/>
        <Stat icon={I.Pkg} label="Unfulfilled" value={unf} sub="Orders pending" color="#fbbf24"/>
        <Stat icon={I.Warn} label="Low Stock" value={low} sub="Need restock" color="#f87171"/>
      </div>
      <Card>
        <div style={{fontSize:14,fontWeight:600,color:'#e2e8f0',marginBottom:16}}>Recent Orders</div>
        {orders.slice(0,5).map((o,i) => (
          <div key={o.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:i<4?'1px solid #22223a':'none'}}>
            <div><div style={{fontSize:13,color:'#e2e8f0'}}>{o.customerName} — {o.orderNumber}</div><div style={{fontSize:11,color:'#64748b'}}>{o.product}</div></div>
            <div style={{display:'flex',alignItems:'center',gap:12}}><span style={{fontSize:13,fontWeight:600,color:'#e2e8f0'}}>€{o.amount?.toFixed(2)}</span><StatusBadge status={o.status}/></div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// --- ORDERS ---
function OrdersPage({orders, setOrders, storeId}) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = orders.filter(o => {
    if (filter !== 'all' && o.status !== filter) return false;
    if (search && !o.customerName.toLowerCase().includes(search.toLowerCase()) && !o.orderNumber.includes(search)) return false;
    return true;
  });

  const updateStatus = async (orderId, newStatus) => {
    await api('/api/orders', {method:'PATCH', body:JSON.stringify({orderId, newStatus})});
    setOrders(orders.map(o => o.id===orderId ? {...o, status:newStatus} : o));
  };

  const statuses = ['all','unfulfilled','shipped','at_post_office','delivered'];
  return (
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div><h2 style={{fontSize:22,fontWeight:700,color:'#e2e8f0',margin:0}}>Order Management</h2><p style={{color:'#64748b',fontSize:13,marginTop:4}}>Track and update all orders</p></div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search orders..." style={{padding:'10px 14px',background:'#12121f',border:'1px solid #2a2a3e',borderRadius:10,color:'#e2e8f0',fontSize:13,outline:'none',fontFamily:'inherit',width:260}}/>
        <div style={{display:'flex',gap:4}}>{statuses.map(s=><Btn key={s} s="sm" v={filter===s?'primary':'secondary'} onClick={()=>setFilter(s)}>{s==='all'?'All':s.replace('_',' ').replace(/\b\w/g,c=>c.toUpperCase())}</Btn>)}</div>
      </div>
      <Card style={{padding:0,overflow:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr>{['Order','Customer','Product','Amount','Status','Actions'].map((h,i)=><th key={i} style={{textAlign:'left',padding:'14px 16px',borderBottom:'1px solid #22223a',color:'#64748b',fontSize:11,fontWeight:600,letterSpacing:'0.5px',textTransform:'uppercase'}}>{h}</th>)}</tr></thead>
          <tbody>{filtered.map(o=>(
            <tr key={o.id} style={{borderBottom:'1px solid #22223a'}}>
              <td style={{padding:'14px 16px',fontSize:13,color:'#6366f1',fontWeight:600}}>{o.orderNumber}</td>
              <td style={{padding:'14px 16px'}}><div style={{fontSize:13,color:'#e2e8f0'}}>{o.customerName}</div><div style={{fontSize:11,color:'#64748b'}}>{o.customerEmail}</div></td>
              <td style={{padding:'14px 16px',fontSize:13,color:'#a8b2d1'}}>{o.product}</td>
              <td style={{padding:'14px 16px',fontSize:13,color:'#e2e8f0',fontWeight:600}}>€{o.amount?.toFixed(2)}</td>
              <td style={{padding:'14px 16px'}}><StatusBadge status={o.status}/>{!o.addressValid&&<span style={{fontSize:10,color:'#f87171',marginLeft:6}}>⚠ Bad address</span>}</td>
              <td style={{padding:'14px 16px'}}><select value={o.status} onChange={e=>updateStatus(o.id,e.target.value)} style={{padding:'6px 10px',background:'#12121f',border:'1px solid #2a2a3e',borderRadius:8,color:'#a8b2d1',fontSize:12,outline:'none',fontFamily:'inherit',cursor:'pointer'}}><option value="unfulfilled">Unfulfilled</option><option value="shipped">Shipped</option><option value="at_post_office">At Post Office</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select></td>
            </tr>
          ))}</tbody>
        </table>
      </Card>
    </div>
  );
}

// --- ADDRESS & EMAILS ---
function AddressPage({orders, emails, setEmails, storeId}) {
  const invalid = orders.filter(o => !o.addressValid);
  const [sending, setSending] = useState(null);

  const sendAddressEmail = async (order) => {
    setSending(order.id);
    try {
      const email = await api('/api/emails', {method:'POST', body:JSON.stringify({orderId:order.id, type:'wrong_address'})});
      setEmails(prev => [email, ...prev]);
    } catch(e) { alert('Failed to send: ' + e.message); }
    setSending(null);
  };

  return (
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div><h2 style={{fontSize:22,fontWeight:700,color:'#e2e8f0',margin:0}}>Address Validation & Emails</h2><p style={{color:'#64748b',fontSize:13,marginTop:4}}>Auto-detect wrong addresses and email customers</p></div>
      {invalid.length > 0 && (
        <Card style={{border:'1px solid #f8717130'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}><I.Warn/><span style={{fontSize:14,fontWeight:600,color:'#f87171'}}>{invalid.length} Invalid Address{invalid.length>1?'es':''}</span></div>
          {invalid.map((o,i) => (
            <div key={o.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 0',borderTop:i>0?'1px solid #22223a':'none',flexWrap:'wrap',gap:8}}>
              <div><div style={{fontSize:13,color:'#e2e8f0',fontWeight:500}}>{o.customerName} — {o.orderNumber}</div><div style={{fontSize:12,color:'#f87171',marginTop:2,fontFamily:'monospace'}}>{o.address} {o.city} {o.zip}</div></div>
              <Btn s="sm" onClick={()=>sendAddressEmail(o)} disabled={sending===o.id}><I.Send/> {sending===o.id?'Sending...':'Send Email'}</Btn>
            </div>
          ))}
        </Card>
      )}
      {invalid.length === 0 && <Card><div style={{textAlign:'center',padding:20,color:'#34d399'}}>✅ All addresses look valid!</div></Card>}
      <Card>
        <div style={{fontSize:14,fontWeight:600,color:'#e2e8f0',marginBottom:16}}>Email History ({emails.length})</div>
        {emails.length === 0 ? <div style={{color:'#64748b',fontSize:13}}>No emails sent yet</div> :
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr>{['Customer','Subject','Type','Status','Sent'].map((h,i)=><th key={i} style={{textAlign:'left',padding:'10px 12px',borderBottom:'1px solid #22223a',color:'#64748b',fontSize:11,fontWeight:600,textTransform:'uppercase'}}>{h}</th>)}</tr></thead>
            <tbody>{emails.map(e=>(
              <tr key={e.id} style={{borderBottom:'1px solid #22223a'}}>
                <td style={{padding:'10px 12px',fontSize:13,color:'#e2e8f0'}}>{e.customer}<br/><span style={{fontSize:11,color:'#64748b'}}>{e.to}</span></td>
                <td style={{padding:'10px 12px',fontSize:12,color:'#a8b2d1',maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{e.subject}</td>
                <td style={{padding:'10px 12px'}}><Badge v={e.type==='wrong_address'?'danger':'info'}>{e.type?.replace('_',' ')}</Badge></td>
                <td style={{padding:'10px 12px'}}><Badge v={e.status==='sent'?'success':'warning'}>{e.status}</Badge></td>
                <td style={{padding:'10px 12px',fontSize:12,color:'#64748b'}}>{e.sentAt ? new Date(e.sentAt).toLocaleString() : '-'}</td>
              </tr>
            ))}</tbody>
          </table>
        }
      </Card>
    </div>
  );
}

// --- PROFIT SHEET ---
function ProfitPage({profit, setProfit}) {
  const totR = profit.reduce((a,b)=>a+(b.revenue||0),0);
  const totC = profit.reduce((a,b)=>a+(b.costs||0),0);
  const totA = profit.reduce((a,b)=>a+(b.adSpend||0),0);
  const totS = profit.reduce((a,b)=>a+(b.shipping||0),0);
  const totP = profit.reduce((a,b)=>a+(b.profit||0),0);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const label = (m) => { const [y,mo] = (m||'').split('-'); return months[parseInt(mo)-1]||m; };

  return (
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div><h2 style={{fontSize:22,fontWeight:700,color:'#e2e8f0',margin:0}}>Profit Sheet</h2><p style={{color:'#64748b',fontSize:13,marginTop:4}}>Auto-generated P&L</p></div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:16}}>
        <Stat icon={I.Dollar} label="Revenue" value={`€${totR.toLocaleString()}`} color="#34d399"/>
        <Stat icon={I.Box} label="COGS" value={`€${totC.toLocaleString()}`} color="#fbbf24"/>
        <Stat icon={I.Trend} label="Ad Spend" value={`€${totA.toLocaleString()}`} color="#f87171"/>
        <Stat icon={I.Truck} label="Shipping" value={`€${totS.toLocaleString()}`} color="#60a5fa"/>
        <Stat icon={I.Dollar} label="Net Profit" value={`€${totP.toLocaleString()}`} sub={totR?`${((totP/totR)*100).toFixed(1)}% margin`:''} color="#6366f1"/>
      </div>
      <Card style={{padding:0,overflow:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr>{['Month','Revenue','COGS','Ad Spend','Shipping','Profit','Margin'].map((h,i)=><th key={i} style={{textAlign:i===0?'left':'right',padding:'14px 16px',borderBottom:'1px solid #22223a',color:'#64748b',fontSize:11,fontWeight:600,textTransform:'uppercase'}}>{h}</th>)}</tr></thead>
          <tbody>
            {profit.map((r,i)=>(
              <tr key={r.id||i} style={{borderBottom:'1px solid #22223a'}}>
                <td style={{padding:'14px 16px',color:'#e2e8f0',fontSize:13,fontWeight:600}}>{label(r.month)}</td>
                <td style={{padding:'14px 16px',textAlign:'right',fontSize:13,color:'#34d399'}}>€{(r.revenue||0).toLocaleString()}</td>
                <td style={{padding:'14px 16px',textAlign:'right',fontSize:13,color:'#fbbf24'}}>€{(r.costs||0).toLocaleString()}</td>
                <td style={{padding:'14px 16px',textAlign:'right',fontSize:13,color:'#f87171'}}>€{(r.adSpend||0).toLocaleString()}</td>
                <td style={{padding:'14px 16px',textAlign:'right',fontSize:13,color:'#60a5fa'}}>€{(r.shipping||0).toLocaleString()}</td>
                <td style={{padding:'14px 16px',textAlign:'right',fontSize:13,fontWeight:700,color:'#34d399'}}>€{(r.profit||0).toLocaleString()}</td>
                <td style={{padding:'14px 16px',textAlign:'right',fontSize:12,color:'#64748b'}}>{r.revenue?((r.profit/r.revenue)*100).toFixed(1):0}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// --- STOCK ---
function StockPage({products, setProducts}) {
  const [showForecast, setShowForecast] = useState(false);
  const daysLeft = (p) => p.salesPerDay > 0 ? Math.floor(p.stock/p.salesPerDay) : Infinity;

  const toggleStock = async (id, current) => {
    await api('/api/products', {method:'PATCH', body:JSON.stringify({productId:id, inStock:!current})});
    setProducts(products.map(p=>p.id===id?{...p,inStock:!current}:p));
  };

  return (
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:12}}>
        <div><h2 style={{fontSize:22,fontWeight:700,color:'#e2e8f0',margin:0}}>Stock Management</h2><p style={{color:'#64748b',fontSize:13,marginTop:4}}>Inventory & restock predictions</p></div>
        <Btn onClick={()=>setShowForecast(!showForecast)} v={showForecast?'primary':'secondary'}><I.Trend/> {showForecast?'Hide':'Show'} Forecaster</Btn>
      </div>
      {showForecast && (
        <Card style={{border:'1px solid #6366f130'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}><I.Trend/><span style={{fontSize:14,fontWeight:600,color:'#e2e8f0'}}>Stock Forecaster</span></div>
          {products.filter(p=>p.inStock).sort((a,b)=>daysLeft(a)-daysLeft(b)).map(p=>{
            const d = daysLeft(p);
            const urg = d<=3?'danger':d<=7?'warning':d<=14?'info':'success';
            return (
              <div key={p.id} style={{display:'flex',alignItems:'center',gap:16,padding:'10px 0',borderBottom:'1px solid #22223a'}}>
                <div style={{width:140,flexShrink:0}}><div style={{fontSize:13,color:'#e2e8f0',fontWeight:500}}>{p.name}</div><div style={{fontSize:11,color:'#64748b'}}>{p.stock} units</div></div>
                <div style={{flex:1,height:8,background:'#22223a',borderRadius:4,overflow:'hidden'}}><div style={{height:'100%',width:`${Math.min(100,(d/40)*100)}%`,background:urg==='danger'?'#f87171':urg==='warning'?'#fbbf24':urg==='info'?'#60a5fa':'#34d399',borderRadius:4}}/></div>
                <Badge v={urg}>{d===Infinity?'∞':`${d}d`}</Badge>
                <div style={{fontSize:11,color:'#64748b',width:60,textAlign:'right'}}>{p.salesPerDay}/day</div>
              </div>
            );
          })}
        </Card>
      )}
      <Card style={{padding:0,overflow:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr>{['Product','SKU','Price','Cost','Stock','Sales/Day','Days Left','Status','Toggle'].map((h,i)=><th key={i} style={{textAlign:'left',padding:'14px 16px',borderBottom:'1px solid #22223a',color:'#64748b',fontSize:11,fontWeight:600,textTransform:'uppercase'}}>{h}</th>)}</tr></thead>
          <tbody>{products.map(p=>{
            const d=daysLeft(p);
            return (
              <tr key={p.id} style={{borderBottom:'1px solid #22223a',opacity:p.inStock?1:0.5}}>
                <td style={{padding:'14px 16px',fontSize:13,color:'#e2e8f0',fontWeight:500}}>{p.name}</td>
                <td style={{padding:'14px 16px',fontSize:12,color:'#64748b',fontFamily:'monospace'}}>{p.sku}</td>
                <td style={{padding:'14px 16px',fontSize:13,color:'#e2e8f0'}}>€{p.price?.toFixed(2)}</td>
                <td style={{padding:'14px 16px',fontSize:13,color:'#64748b'}}>€{p.cost?.toFixed(2)}</td>
                <td style={{padding:'14px 16px',fontSize:13,fontWeight:600,color:p.stock===0?'#f87171':p.stock<10?'#fbbf24':'#34d399'}}>{p.stock}</td>
                <td style={{padding:'14px 16px',fontSize:13,color:'#a8b2d1'}}>{p.salesPerDay}</td>
                <td style={{padding:'14px 16px'}}><Badge v={d<=3?'danger':d<=7?'warning':d<=14?'info':'success'}>{p.stock===0?'OUT':d===Infinity?'∞':`${d}d`}</Badge></td>
                <td style={{padding:'14px 16px'}}><Badge v={p.inStock?'success':'danger'}>{p.inStock?'In Stock':'Out'}</Badge></td>
                <td style={{padding:'14px 16px'}}>
                  <div onClick={()=>toggleStock(p.id,p.inStock)} style={{width:44,height:24,borderRadius:12,background:p.inStock?'#6366f1':'#2a2a3e',cursor:'pointer',position:'relative'}}>
                    <div style={{width:18,height:18,borderRadius:9,background:'#fff',position:'absolute',top:3,left:p.inStock?23:3,transition:'all 0.2s'}}/>
                  </div>
                </td>
              </tr>
            );
          })}</tbody>
        </table>
      </Card>
    </div>
  );
}

// --- SETTINGS ---
function SettingsPage({storeId, setStoreId}) {
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [msg, setMsg] = useState('');

  const connect = async () => {
    setConnecting(true); setMsg('');
    try {
      const res = await api('/api/store/connect', {method:'POST', body:JSON.stringify({shopifyUrl:url, accessToken:token})});
      if (res.success) { setStoreId(res.store.id); setMsg('✅ Connected! Store: ' + res.store.name); }
      else setMsg('❌ ' + (res.error||'Failed'));
    } catch(e) { setMsg('❌ ' + e.message); }
    setConnecting(false);
  };

  return (
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div><h2 style={{fontSize:22,fontWeight:700,color:'#e2e8f0',margin:0}}>Settings</h2><p style={{color:'#64748b',fontSize:13,marginTop:4}}>Connect your Shopify store</p></div>
      <Card>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
          <div style={{width:40,height:40,borderRadius:10,background:'#95BF4720',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>🟢</div>
          <div><div style={{fontSize:14,fontWeight:600,color:'#e2e8f0'}}>Shopify Integration</div><div style={{fontSize:12,color:'#64748b'}}>{storeId?'Connected':'Not connected'}</div></div>
          {storeId && <Badge v="success">Connected</Badge>}
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:16}}>
          <div>
            <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Store URL</label>
            <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="yourstore.myshopify.com" style={{width:'100%',padding:'10px 14px',background:'#12121f',border:'1px solid #2a2a3e',borderRadius:10,color:'#e2e8f0',fontSize:13,outline:'none',fontFamily:'inherit'}}/>
          </div>
          <div>
            <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>API Access Token</label>
            <input type="password" value={token} onChange={e=>setToken(e.target.value)} placeholder="shpat_xxxxxxxxxxxxxxxxxxxxx" style={{width:'100%',padding:'10px 14px',background:'#12121f',border:'1px solid #2a2a3e',borderRadius:10,color:'#e2e8f0',fontSize:13,outline:'none',fontFamily:'inherit'}}/>
          </div>
        </div>
        <Btn onClick={connect} disabled={connecting||!url||!token}>{connecting?'Connecting...':'Connect Store'}</Btn>
        {msg && <div style={{marginTop:12,fontSize:13,color:msg.startsWith('✅')?'#34d399':'#f87171'}}>{msg}</div>}
        {!storeId && (
          <div style={{marginTop:20,padding:16,background:'#12121f',borderRadius:10,fontSize:12,color:'#a8b2d1',lineHeight:1.8}}>
            <strong style={{color:'#e2e8f0'}}>How to connect:</strong><br/>
            1. Go to Shopify Admin → Settings → Apps and sales channels<br/>
            2. Click "Develop apps" → Create an app → Name it "Backend.io"<br/>
            3. Configure scopes: read_orders, write_orders, read_products, write_products, read_customers, read_fulfillments, write_fulfillments<br/>
            4. Install the app and copy the Admin API access token<br/>
            5. Paste your store URL and token above
          </div>
        )}
      </Card>
      <Card>
        <div style={{fontSize:14,fontWeight:600,color:'#e2e8f0',marginBottom:8}}>Tracking Page</div>
        <p style={{fontSize:13,color:'#64748b',marginBottom:12}}>Your customers can track packages at:</p>
        <div style={{padding:'12px 16px',background:'#12121f',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <code style={{fontSize:13,color:'#6366f1'}}>https://backend-io-psi.vercel.app/track/TRACKING_NUMBER</code>
          <I.Ext/>
        </div>
      </Card>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
const tabs = [
  {id:'dashboard',label:'Dashboard',icon:I.Home},
  {id:'orders',label:'Orders',icon:I.Pkg},
  {id:'address',label:'Address & Emails',icon:I.Mail},
  {id:'profit',label:'Profit Sheet',icon:I.Dollar},
  {id:'stock',label:'Stock',icon:I.Box},
  {id:'settings',label:'Settings',icon:I.Gear},
];

export default function Admin() {
  const [tab, setTab] = useState('dashboard');
  const [storeId, setStoreId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [emails, setEmails] = useState([]);
  const [profit, setProfit] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Try to find an existing store
      const ordersData = await api('/api/orders?storeId=any');
      // If we get data, find the storeId from it
      if (Array.isArray(ordersData) && ordersData.length > 0) {
        const sid = ordersData[0].storeId;
        setStoreId(sid);
        setOrders(ordersData);
        const [prods, mails, prof] = await Promise.all([
          api(`/api/products?storeId=${sid}`),
          api(`/api/emails?storeId=${sid}`),
          api(`/api/profit?storeId=${sid}`),
        ]);
        setProducts(Array.isArray(prods)?prods:[]);
        setEmails(Array.isArray(mails)?mails:[]);
        setProfit(Array.isArray(prof)?prof:[]);
      }
    } catch(e) { console.error('Load error:', e); }
    setLoaded(true);
  };

  const syncShopify = async () => {
    if (!storeId) return;
    setSyncing(true);
    try {
      await api('/api/sync', {method:'POST', body:JSON.stringify({storeId})});
      await loadData();
    } catch(e) { console.error('Sync error:', e); }
    setSyncing(false);
  };

  const renderPage = () => {
    switch(tab) {
      case 'dashboard': return <DashboardPage orders={orders} products={products} profit={profit}/>;
      case 'orders': return <OrdersPage orders={orders} setOrders={setOrders} storeId={storeId}/>;
      case 'address': return <AddressPage orders={orders} emails={emails} setEmails={setEmails} storeId={storeId}/>;
      case 'profit': return <ProfitPage profit={profit} setProfit={setProfit}/>;
      case 'stock': return <StockPage products={products} setProducts={setProducts}/>;
      case 'settings': return <SettingsPage storeId={storeId} setStoreId={setStoreId}/>;
      default: return <DashboardPage orders={orders} products={products} profit={profit}/>;
    }
  };

  return (
    <>
      <Head>
        <title>Backend.io — Admin</title>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      </Head>
      <div style={{display:'flex',height:'100vh',background:'#0b0b18',fontFamily:"'DM Sans', sans-serif",color:'#e2e8f0',overflow:'hidden'}}>
        {/* Sidebar */}
        <div style={{width:220,background:'#0f0f1e',borderRight:'1px solid #1a1a2e',display:'flex',flexDirection:'column',flexShrink:0}}>
          <div style={{padding:'20px',display:'flex',alignItems:'center',gap:10,borderBottom:'1px solid #1a1a2e'}}>
            <div style={{width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:16,color:'#fff'}}>B</div>
            <div><div style={{fontSize:16,fontWeight:700,color:'#e2e8f0',letterSpacing:'-0.3px'}}>Backend.io</div><div style={{fontSize:10,color:'#64748b'}}>Store Manager</div></div>
          </div>
          <div style={{padding:'12px 8px',display:'flex',flexDirection:'column',gap:2,flex:1}}>
            {tabs.map(t=>(
              <div key={t.id} onClick={()=>setTab(t.id)} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:10,cursor:'pointer',background:tab===t.id?'#6366f115':'transparent',color:tab===t.id?'#6366f1':'#64748b',transition:'all 0.15s'}}>
                <t.icon/><span style={{fontSize:13,fontWeight:tab===t.id?600:400}}>{t.label}</span>
              </div>
            ))}
          </div>
          {storeId && (
            <div style={{padding:'12px 16px',borderTop:'1px solid #1a1a2e'}}>
              <Btn s="sm" v="secondary" onClick={syncShopify} disabled={syncing} style={{width:'100%',justifyContent:'center'}}>
                <I.Sync/> {syncing?'Syncing...':'Sync Shopify'}
              </Btn>
            </div>
          )}
        </div>
        {/* Main */}
        <div style={{flex:1,overflow:'auto',padding:32}}>
          <div style={{maxWidth:1100,margin:'0 auto'}}>
            {!loaded ? <div style={{textAlign:'center',padding:60,color:'#64748b'}}>Loading...</div> : renderPage()}
          </div>
        </div>
      </div>
    </>
  );
}
