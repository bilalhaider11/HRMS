import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchTeamsTableData } from '../api/teams';
import { fetchEmploeeTableData } from 'features/dashboard/api/dashboard';

export interface TeamsTableData {
    teamId?: number,
    teamName?: string,
    teamDescription?: string,
    teamLeadId?: number,
    teamLeadName?: string,
    teamMembers?: EmployeeTableData[],
    companyId?: number,
    companyName?: string
}
export interface EmployeeTableData {
  id?: string;
  name?: string;
}

interface TeamsContextType {
    teamList: TeamsTableData[];
    employeeList: EmployeeTableData[];
    editingTeam: TeamsTableData | null;
    setEditingTeam: (team: TeamsTableData | null) => void;
    addTeam: (team: TeamsTableData) => boolean;
    idExistError: string;
    clearError: () => void;
    successfullModal: boolean;
    setSuccessfullModal: (value: boolean) => void;
    isOpenMembersModal: boolean;
    setIsOpenMembersModal: (value: boolean) => void;
    isDeleteTeamModal: TeamsTableData | null
    setIsDeleteTeamModal: (team: TeamsTableData | null) => void
    updateTeam: (team: TeamsTableData) => void
    editTeamData: (team: TeamsTableData) => void;
    handleTeamDelete: (team: TeamsTableData) => void
    handleAddMemberModal: () => void
    handleCloseMemberModal: () => void
    selectedMembers: EmployeeTableData[]
    setSelectedMembers: (members: EmployeeTableData[]) => void
    removeMember: (member: EmployeeTableData) => void
}


const TeamsContext = createContext<TeamsContextType | undefined>(undefined);

export const useTeams = () => {
    const context = useContext(TeamsContext);
    if (!context) {
        throw new Error('Error');
    }
    return context;
};

interface TeamsProviderProps {
    children: ReactNode;
}

export const TeamsProvider: React.FC<TeamsProviderProps> = ({ children }) => {

    const [teamList, setTeamList] = useState<TeamsTableData[]>([])
    const [employeeList, setEmployeeList] = useState<EmployeeTableData[]>([])
    const [editingTeam, setEditingTeam] = useState<TeamsTableData | null>(null)
    const [idExistError, setIdExistError] = useState("")
    const [successfullModal, setSuccessfullModal] = useState<boolean>(false)
    const [isOpenMembersModal, setIsOpenMembersModal] = useState<boolean>(false)
    const [isDeleteTeamModal, setIsDeleteTeamModal] = useState<TeamsTableData | null>(null)
    const [selectedMembers, setSelectedMembers] = useState<EmployeeTableData[]>([])


    const clearError = () => setIdExistError("");

    useEffect(() => {
        const loadTeams = async () => {
            try {
                const data = await fetchTeamsTableData();
                setTeamList(data.teamsAllList);
            } catch (error) {
                console.error(error);
            }
        }

        const loadEmployees = async () => {
            try {
                const data = await fetchEmploeeTableData()
                setEmployeeList(data.employeesList)
            } catch (error) {
                console.log(error)
            }
        }

        loadTeams()
        loadEmployees()

    }, []);


    const addTeam = (team: TeamsTableData) => {
        const updatedList = [...teamList, team];
        console.log("added")
        setTeamList(updatedList);
        setEditingTeam(null)
        setSelectedMembers([]);
        setIdExistError("")
        setSuccessfullModal(true)
        window.scrollTo(0, 0);
        document.body.style.overflow = "hidden"
        return true

    };

    const editTeamData = (team: TeamsTableData) => {
        console.log(team)
        setTeamList(prev => prev.map(t => t.teamId === team.teamId ? team : t));
        setEditingTeam(team);
        setSelectedMembers(team.teamMembers || []);
        setSuccessfullModal(false);
        document.body.style.overflow = "auto";
        window.scrollTo(0, 0);
    };

    const updateTeam = (updatedTeam: TeamsTableData) => {
        const updatedList = teamList.map((team) =>
            team.teamId === updatedTeam.teamId ? updatedTeam : team
        );
        console.log("updateList", updatedList)
        setTeamList(updatedList);
        setSuccessfullModal(true);
        document.body.style.overflow = "hidden";
        window.scrollTo(0, 0);
        setIdExistError("");
    };

    const handleTeamDelete = (team: TeamsTableData) => {
        const updatingList = teamList.filter(i => i.teamId !== team.teamId)
        setTeamList(updatingList)
        setIsDeleteTeamModal(null)
        window.scrollTo(0, 0);
        document.body.style.overflow = "auto"
    }
    const handleAddMemberModal = () => {
        setSelectedMembers(editingTeam?.teamMembers || []);
        setIsOpenMembersModal(true)
        window.scrollTo(0, 0);
        document.body.style.overflow = "hidden"
    }

    const handleCloseMemberModal = () => {
        if (editingTeam) {
            setEditingTeam({ ...editingTeam, teamMembers: selectedMembers });
        }
        setIsOpenMembersModal(false)
         window.scrollTo(0, 0);
        document.body.style.overflow = "auto"
    }
    const removeMember = (member: EmployeeTableData) => {
        setSelectedMembers(selectedMembers.filter(m => m.id !== member.id))
    }


    return (
        <TeamsContext.Provider value={{ teamList, employeeList, setEditingTeam, editingTeam, handleTeamDelete, addTeam, updateTeam, editTeamData, idExistError, setIsDeleteTeamModal, isDeleteTeamModal, setSuccessfullModal, successfullModal, clearError, handleAddMemberModal, isOpenMembersModal, setIsOpenMembersModal, handleCloseMemberModal, selectedMembers, setSelectedMembers, removeMember }}>
            {children}
        </TeamsContext.Provider>
    );
};
