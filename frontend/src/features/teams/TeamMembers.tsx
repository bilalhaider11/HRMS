import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ImageButton from "shared/ImageButton";
import backImg from "../../assets/images/back.svg";
import Box from "shared/Box";
import { TeamsTableData, useTeams } from "./modal/teamsContext";

const TeamMembers = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { teamList, getTeamById } = useTeams();
  const [team, setTeam] = useState<TeamsTableData | null>(null);

  useEffect(() => {
    const loadTeam = async () => {
      const parsedTeamId = Number(teamId);
      if (!parsedTeamId) return;

      const localTeam = teamList.find((item) => item.teamId === parsedTeamId);
      if (localTeam) {
        setTeam(localTeam);
        return;
      }

      try {
        const remoteTeam = await getTeamById(parsedTeamId);
        setTeam(remoteTeam);
      } catch (error) {
        console.error(error);
      }
    };

    loadTeam();
  }, [teamId, teamList, getTeamById]);

  return (
    <>
      <ImageButton type="button" onClick={() => navigate(-1)} buttonClasses="mt-5 w-5 h-5 md:w-7 md:h-7">
        <img src={backImg} alt="back" />
      </ImageButton>
      <h2 className="mt-5 md:mt-[46px] text-2xl md:text-3xl lg:text-[48px] font-semibold font-poppins lg:leading-[140%] text-white">
        {team?.teamName || "Team"} Members
      </h2>
      <p className="text-slate-300 mt-3 font-inter">
        Team Lead: {team?.teamLeadName || "N/A"}
      </p>

      <Box boxMainDivClasses="mt-[30px] transition-all duration-500 delay-300">
        <div className="w-full overflowXAuto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-slate-800/50">
              <tr className="border-b border-slate-700">
                <th className="py-3 px-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider font-inter">Employee Id</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider font-inter">Employee Code</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider font-inter">Name</th>
              </tr>
            </thead>
            <tbody>
              {(team?.teamMembers || []).map((member) => (
                <tr key={member.id}>
                  <td className="py-4 px-4 text-sm text-slate-200 font-inter">{member.id}</td>
                  <td className="py-4 px-4 text-sm text-slate-200 font-inter">{member.employeeCode || "-"}</td>
                  <td className="py-4 px-4 text-sm text-slate-200 font-inter">{member.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Box>
    </>
  );
};

export default TeamMembers;
