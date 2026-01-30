import Button from "../../shared/Button"

import { useNavigate } from "react-router-dom"
import TeamsTable from "./ui/TeamsTable"
import { useTeams } from "./modal/teamsContext"
import { useEffect } from "react"

const TeamsBody = () => {
    const navigate = useNavigate()
    const { setEditingTeam } = useTeams()

    useEffect(() => {
        setEditingTeam(null);
    }, []);
    return (
        <>
            <Button onClick={() => navigate("new-team")} type="button" buttonClasses="bodyBackground w-fit fade-bottom rounded-[15px] p-2.5 md:py-[26px] md:px-2 lg:px-8 flex justify-center items-center font-poppins font-semibold md:text-lg leading-normal gap-[18px] h-11 sm:h-14 md:h-[73px] text-white" >
                <div className="sm:w-[21px] sm:h-[21px] w-4 h-4">
                  
                </div>
                Add new team
            </Button>
            <TeamsTable />
        </>
    )
}

export default TeamsBody