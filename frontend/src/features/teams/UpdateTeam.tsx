import ImageButton from "shared/ImageButton";
import backImg from "../../assets/images/back.svg";
import { useNavigate } from "react-router-dom";
import AddTeamForm from "./ui/AddTeamForm";
import { useEffect } from "react";
import { useTeams } from "./modal/teamsContext";
import { useParams } from "react-router-dom";

const UpdateTeam = () => {
  const { teamList, editTeamData, editingTeam } = useTeams();

  const { teamId } = useParams();
  console.log(teamId, "ID");
  const navigate = useNavigate();

  const backPgae = () => {
    navigate(-1);
  };

  useEffect(() => {
    if (teamList.length > 0 && editingTeam === null) {
      const foundTeam = teamList.find(
        (team) => team?.teamId === parseInt(teamId || "")
      );
      console.log(foundTeam, "Found");
      if (foundTeam) {
        editTeamData(foundTeam);
      }
    }
    return;
  }, [teamList, teamId]);
  return (
    <>
      <ImageButton type="button" onClick={backPgae} buttonClasses="mt-5 w-5 h-5 md:w-7 md:h-7">
        <img src={backImg} alt="back Image" />
      </ImageButton>
      <h2 className="mt-5 md:mt-[46px] text-2xl md:text-3xl lg:text-[58px] font-semibold font-poppins lg:leading-[140%] text-white">
        Update the Team
      </h2>
      <AddTeamForm />
    </>
  );
};

export default UpdateTeam;
