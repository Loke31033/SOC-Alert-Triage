"use client";
import { useEffect,useState } from "react";
type Team={team_id:string;team_name:string|null;completed:number;total_scenarios:number;total_score:number};
export default function TeamsPage(){
 const [teams,setTeams]=useState<Team[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState(""); const [deletingTeam,setDeletingTeam]=useState<string | null>(null);
 useEffect(()=>{fetch("/api/admin/teams",{cache:"no-store"}).then(r=>r.json()).then(d=>{if(!d.success)throw new Error(d.error);setTeams(d.teams||[])}).catch(e=>setError(e.message)).finally(()=>setLoading(false))},[]);

 async function handleDeleteTeam(
   teamId: string,
   teamName: string | null
 ) {
   const confirmed = window.confirm(
     `Delete ${teamName || teamId} (${teamId})?\n\n` +
     `This will remove the team and its registered students.\n\n` +
     `This action cannot be undone.`
   );

   if (!confirmed) {
     return;
   }

   setDeletingTeam(teamId);
   setError("");

   try {
     const response = await fetch(
       `/api/admin/teams/${encodeURIComponent(teamId)}`,
       {
         method: "DELETE",
         credentials: "include",
         cache: "no-store",
       }
     );

     const data = await response.json();

     if (!response.ok || !data.success) {
       throw new Error(
         data?.error || "Unable to delete team."
       );
     }

     setTeams((current) =>
       current.filter(
         (team) => team.team_id !== teamId
       )
     );

   } catch (error) {
     console.error(
       "[ADMIN DELETE TEAM]",
       error
     );

     setError(
       error instanceof Error
         ? error.message
         : "Unable to delete team."
     );

   } finally {
     setDeletingTeam(null);
   }
 }

 return <div><div className="ops-page-head"><div><span className="eyebrow">OPERATIONS</span><h1>Teams</h1><p>Monitor registration, scenario completion and aggregate scores.</p></div></div>
 {error&&<div className="ops-alert danger">{error}</div>}
 <section className="ops-panel"><div className="table-wrap"><table className="ops-table"><thead><tr><th>TEAM</th><th>SCENARIO 01</th><th>SCENARIO 02</th><th>SCENARIO 03</th><th>SCENARIO 04</th><th>PROGRESS</th><th>SCORE</th><th>ACTIONS</th></tr></thead><tbody>
 {loading?<tr><td colSpan={8} className="empty">Loading teams…</td></tr>:teams.map(t=><tr key={t.team_id}><td><a className="table-link" href={`/admin/teams/${t.team_id}`}><b>{t.team_id}</b><small>{t.team_name}</small></a></td>{["scenario01","scenario02","scenario03","scenario04"].map(s=>{const r=(t as any).scenarios?.[s];return <td key={s}>{r?<span className="score-chip">{r.percentage}%</span>:<span className="muted">PENDING</span>}</td>})}<td><div className="mini-progress"><i style={{width:`${t.completed*25}%`}}/></div><small>{t.completed}/4</small></td><td><b>{t.total_score}</b></td>
<td>
<button
  type="button"
  className="admin-delete-team-button"
  disabled={deletingTeam === t.team_id}
  onClick={() =>
    handleDeleteTeam(
      t.team_id,
      t.team_name
    )
  }
>
  {deletingTeam === t.team_id
    ? "DELETING..."
    : "DELETE"}
</button>
</td></tr>)}
 </tbody></table></div></section></div>
}
