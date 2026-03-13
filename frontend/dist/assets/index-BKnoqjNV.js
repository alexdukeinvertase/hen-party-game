(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))a(o);new MutationObserver(o=>{for(const r of o)if(r.type==="childList")for(const p of r.addedNodes)p.tagName==="LINK"&&p.rel==="modulepreload"&&a(p)}).observe(document,{childList:!0,subtree:!0});function s(o){const r={};return o.integrity&&(r.integrity=o.integrity),o.referrerPolicy&&(r.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?r.credentials="include":o.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function a(o){if(o.ep)return;o.ep=!0;const r=s(o);fetch(o.href,r)}})();const u="https://script.google.com/macros/s/AKfycbxLb0dF_CSTtDwFRV4RW90Yht--MSeeJX6xLeqHmTtI2rrF8lQUNseVi7Fcsb7G246lFg/exec";async function S(e,t){const s=`${u}?action=sync&playerId=${e||""}&token=${t||""}`;try{const a=await fetch(s);if(!a.ok){console.error("API error status:",a.status);const o=await a.text();return console.error("API response body:",o),{state:"OFFLINE"}}return await a.json()}catch(a){return console.error("Sync failed:",a),{state:"OFFLINE"}}}async function x(e,t){try{return await(await fetch(u,{method:"POST",body:JSON.stringify({action:"join",name:e,deviceToken:t})})).json()}catch(s){return console.error("Join failed:",s),{status:"error",message:"Connection error"}}}async function w(e,t,s,a){try{return await(await fetch(u,{method:"POST",body:JSON.stringify({action:"vote",playerId:e,token:t,questionId:s,selection:a})})).json()}catch(o){return console.error("Vote failed:",o),{status:"error",message:"Connection error"}}}async function g(e){try{return await(await fetch(u,{method:"POST",body:JSON.stringify({action:"adminControl",...e})})).json()}catch(t){return console.error("Admin control failed:",t),{status:"error",message:"Connection error"}}}const v=document.querySelector("#app");let i=localStorage.getItem("hens_host_code")||"";async function d(){i?await k():I()}function I(){v.innerHTML=`
    <div class="screen">
      <div class="glass-card">
        <h1>Host Login</h1>
        <p>Enter the host code to manage the game.</p>
        <input type="password" id="hostCodeInput" placeholder="Host code...">
        <button id="loginBtn">Login</button>
      </div>
    </div>
  `,document.querySelector("#loginBtn").onclick=()=>{i=document.querySelector("#hostCodeInput").value,localStorage.setItem("hens_host_code",i),d()}}async function k(){const e=await g({hostCode:i,adminAction:"getAdminStatus"});if(e.status==="error"){alert("Invalid host code"),localStorage.removeItem("hens_host_code"),i="",d();return}v.innerHTML=`
    <div class="screen" style="max-height: none; overflow-y: auto; padding: 40px 20px;">
      <div class="glass-card" style="max-width: 600px;">
        <h1>Admin Portal</h1>
        <p>Current State: <strong>${e.state}</strong></p>
        
        <div class="admin-controls" style="margin: 30px 0; display: flex; gap: 10px; flex-wrap: wrap;">
          <button id="startJoining" style="flex: 1; min-width: 140px; background: #666;">Set Joining</button>
          <button id="startVoting" style="flex: 1; min-width: 140px; background: #28a745;">Start Voting</button>
          <button id="showResults" style="flex: 1; min-width: 140px; background: #ec135b;">Reveal Results</button>
        </div>

        <h3>Players (${e.players.length})</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 0.9rem;">
          <thead>
            <tr style="border-bottom: 2px solid var(--soft-rose);">
              <th style="text-align: left; padding: 10px;">Name</th>
              <th style="padding: 10px;">Joined</th>
              <th style="padding: 10px;">Done</th>
              <th style="padding: 10px;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${e.players.map(t=>`
              <tr style="border-bottom: 1px solid var(--soft-rose);">
                <td style="padding: 10px;">${t.name}</td>
                <td style="text-align: center; padding: 10px;">${t.joined?"✅":"○"}</td>
                <td style="text-align: center; padding: 10px;">${t.completed?"✅":"○"}</td>
                <td style="padding: 10px;">
                  <button class="reset-btn" data-name="${t.name}" style="padding: 4px 8px; font-size: 0.7rem; border-radius: 4px;">Reset</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <button id="refreshBtn" style="margin-top: 30px; background: transparent; border: 1px solid var(--primary-pink); color: var(--primary-pink);">Refresh Status</button>
      </div>
    </div>
  `,document.querySelector("#startJoining").onclick=()=>y("JOINING"),document.querySelector("#startVoting").onclick=()=>y("VOTING"),document.querySelector("#showResults").onclick=()=>y("RESULTS"),document.querySelector("#refreshBtn").onclick=()=>d(),document.querySelectorAll(".reset-btn").forEach(t=>{t.onclick=async()=>{const s=t.getAttribute("data-name");await g({hostCode:i,adminAction:"resetName",targetPlayer:s}),d()}})}async function y(e){(await g({hostCode:i,newState:e})).status==="SUCCESS"&&d()}const c={PLAYER_ID:"hens_player_id",PLAYER_NAME:"hens_player_name",DEVICE_TOKEN:"hens_device_token"},n={gameState:"LOADING",playerId:localStorage.getItem(c.PLAYER_ID),playerName:localStorage.getItem(c.PLAYER_NAME),deviceToken:C(),answeredCount:0,results:[],bachelors:["Alfie","Ben","Theo","Max","Harry","Tom","Jack","Ollie","James","Sam","Ryan","Chris","Dom","Luca"],isPolling:!1},l=document.querySelector("#app");function C(){let e=localStorage.getItem(c.DEVICE_TOKEN);return e||(e="dev-"+Math.random().toString(36).substr(2,9)+"-"+Date.now(),localStorage.setItem(c.DEVICE_TOKEN,e)),e}async function L(){if(window.location.pathname==="/admin"){d();return}await b(),N(),m()}function N(){n.isPolling||(n.isPolling=!0,setInterval(b,3e3))}async function b(){if(window.location.pathname==="/admin")return;const e=await S(n.playerId,n.deviceToken),t=n.gameState;n.gameState=e.state,n.answeredCount=e.answeredCount||0,e.results&&(n.results=e.results),e.playerName&&(n.playerName=e.playerName),t!==n.gameState&&m()}function m(){l.innerHTML="",n.gameState==="LOADING"?E():n.gameState==="OFFLINE"?T():n.gameState==="JOINING"?n.playerId?h("Waiting for the host to start the game"):f():n.gameState==="VOTING"?n.playerId?n.answeredCount<10?A():h("All votes submitted. Waiting for results..."):f():n.gameState==="RESULTS"&&O()}function E(){l.innerHTML='<div class="screen"><div class="glass-card"><h1>Loading...</h1></div></div>'}function T(){l.innerHTML='<div class="screen"><div class="glass-card"><h1>Offline</h1><p>Connection lost.</p></div></div>'}async function f(){const e=["Abbie G","Parisa","Alex","Sue","Carole","Charlotte P","Nicola K","Char S","Grace","Ruby","Beth","Nicola B"];l.innerHTML=`
    <div class="screen">
      <div class="glass-card">
        <h1 style="font-family: 'Playfair Display', serif;">The Bachelorette</h1>
        <p style="margin-bottom: 25px;">Choose your name to join the game.</p>
        
        <div style="text-align: left; margin-bottom: 10px; font-weight: 600; color: var(--primary-pink);">Your name</div>
        <select id="nameSelect" style="width: 100%; padding: 14px; border-radius: 12px; border: 1px solid var(--soft-rose); background: rgba(255,255,255,0.8); font-size: 1rem; margin-bottom: 20px;">
          <option value="" disabled selected>Select from list...</option>
          ${e.map(a=>`<option value="${a}">${a}</option>`).join("")}
        </select>
        
        <button id="joinBtn" disabled>Join game</button>
        <p style="margin-top: 15px; font-size: 0.85rem; color: #666;">Only people who join will be counted in the game.</p>
      </div>
    </div>
  `;const t=document.querySelector("#nameSelect"),s=document.querySelector("#joinBtn");t.onchange=()=>{s.disabled=!t.value},s.onclick=async()=>{s.disabled=!0,s.textContent="Joining...";const a=await x(t.value,n.deviceToken);a.status==="SUCCESS"?(n.playerId=a.playerId,n.playerName=a.playerName,localStorage.setItem(c.PLAYER_ID,a.playerId),localStorage.setItem(c.PLAYER_NAME,a.playerName),m()):a.status==="BLOCKED"?(alert(a.message),s.disabled=!1,s.textContent="Join game"):(alert("Failed to join. Please try again."),s.disabled=!1,s.textContent="Join game")}}function h(e){l.innerHTML=`
    <div class="screen">
      <div class="glass-card">
        <h1 style="font-family: 'Playfair Display', serif;">The Bachelorette</h1>
        <p style="margin: 20px 0;">${e}</p>
        <div style="margin-top: 20px;">
          <div style="font-size: 2rem; font-weight: 700; color: var(--primary-pink);">${n.answeredCount} / 10</div>
          <p style="font-size: 0.8rem; margin-top: 5px; opacity: 0.7;">QUESTIONS ANSWERED</p>
        </div>
      </div>
    </div>
  `}function O(){l.innerHTML=`
    <div class="screen" style="max-height: none; padding: 40px 0;">
      <div class="glass-card" style="width: 90%; max-width: 450px;">
        <h1 style="font-family: 'Playfair Display', serif;">The Results</h1>
        <p style="margin-bottom: 30px;">Who is husband material?</p>
        
        <div class="results-list" style="text-align: left;">
          ${n.results.map((e,t)=>`
            <div class="result-row" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 15px; background: ${t===0?"rgba(236, 19, 91, 0.1)":"rgba(255,255,255,0.4)"}; border-radius: 12px; margin-bottom: 10px; border: 1px solid ${t===0?"var(--primary-pink)":"var(--soft-rose)"}">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-weight: 700; opacity: ${t<3?"1":"0.5"};">${t+1}.</span>
                <span style="font-weight: 600;">${e.name}</span>
              </div>
              <span style="font-weight: 700; color: var(--primary-pink);">${e.votes} votes</span>
            </div>
          `).join("")}
        </div>

        <p style="margin-top: 30px; font-style: italic; font-size: 0.9rem;">Thanks for playing!</p>
      </div>
    </div>
  `}function A(){const e=n.answeredCount,s=["Who’s most likely to say they’re looking for a “high-value woman”?","Who’s most likely to say they “don’t really like Little Wayne”?","Who’s most likely to stage a rose scavenger hunt around Hertford on your first date?","Who’s most likely to ask you to stop sending voice note videos?","Who’s most likely to DM a footballer “great game today mate”?","Who’s most likely to start a podcast no one asked for?","Who’s most likely to “live” in a dilapidated converted mechanics pit?","Who’s most likely to send an unsolicited pic?","Who says “all wine tastes the same”?","Who’s most likely to have a secret subscription to Bonnie Blue’s OnlyFans?"][e];let a=null;l.innerHTML=`
    <div class="screen" style="max-height: none; padding: 20px 0;">
      <div class="glass-card" style="padding: 1.5rem;">
        <p style="color: var(--primary-pink); font-weight: 600; font-size: 0.9rem;">QUESTION ${e+1} OF 10</p>
        <h2 style="margin: 10px 0 20px 0; font-size: 1.4rem;">${s}</h2>
        
        <div class="tile-grid">
          ${n.bachelors.map(o=>`<div class="name-tile" data-name="${o}">${o}</div>`).join("")}
        </div>
        
        <button id="submitVote" disabled>Select an answer</button>
      </div>
    </div>
  `,document.querySelectorAll(".name-tile").forEach(o=>{o.onclick=()=>{document.querySelectorAll(".name-tile").forEach(p=>p.classList.remove("selected")),o.classList.add("selected"),a=o.getAttribute("data-name");const r=document.querySelector("#submitVote");r.disabled=!1,r.textContent="Submit vote"}}),document.querySelector("#submitVote").onclick=async()=>{const o=document.querySelector("#submitVote");o.disabled=!0,o.textContent="Submitting...",(await w(n.playerId,n.deviceToken,e+1,a)).status==="SUCCESS"?(n.answeredCount++,m()):(alert("Failed to submit vote. Try again."),o.disabled=!1,o.textContent="Submit vote")}}L();
