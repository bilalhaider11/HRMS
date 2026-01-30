import ImageButton from "shared/ImageButton"
import backImg from "../../assets/images/back.svg"
import { useNavigate } from "react-router-dom"
import AddTeamForm from "./ui/AddTeamForm"
import { useTeams } from "./modal/teamsContext"
import { useEffect } from "react"

const NewTeam = () => {
    const navigate = useNavigate()
    const { setEditingTeam, setSelectedMembers } = useTeams()
    

    useEffect(() => {
        setEditingTeam(null);
        setSelectedMembers([]);
    }, [setEditingTeam, setSelectedMembers]);

    const backPgae = () => {
        navigate(-1)
    }
    return (
        <>
            <ImageButton type="button" onClick={backPgae} buttonClasses="mt-5 w-5 h-5 md:w-7 md:h-7">
                <img src={backImg} alt="back Image" />
            </ImageButton>
            <h2 className="mt-5 md:mt-[46px] text-2xl md:text-3xl lg:text-[58px] font-semibold font-poppins lg:leading-[140%] text-white">
                Create New Team
            </h2>
            <AddTeamForm />
        </>
    )
}

export default NewTeam