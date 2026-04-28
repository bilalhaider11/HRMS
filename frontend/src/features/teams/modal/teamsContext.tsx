import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createTeam, deleteTeamById, fetchEmployeesForTeams, fetchTeamById, fetchTeamsTableData, updateTeamById, TeamUpdatePayload } from '../api/teams';

export interface TeamsTableData {
    teamId?: number,
    teamName?: string,
    teamDescription?: string,
    teamLeadId?: number,
    teamLeadName?: string,
    teamMembers?: EmployeeTableData[],
}
export interface EmployeeTableData {
  id?: number;
  employeeCode?: string;
  name?: string;
}

interface TeamsContextType {
    teamList: TeamsTableData[];
    employeeList: EmployeeTableData[];
    editingTeam: TeamsTableData | null;
    setEditingTeam: (team: TeamsTableData | null) => void;
    addTeam: (team: TeamsTableData) => Promise<boolean>;
    idExistError: string;
    clearError: () => void;
    successfullModal: boolean;
    setSuccessfullModal: (value: boolean) => void;
    isOpenMembersModal: boolean;
    setIsOpenMembersModal: (value: boolean) => void;
    isDeleteTeamModal: TeamsTableData | null
    setIsDeleteTeamModal: (team: TeamsTableData | null) => void
    updateTeam: (team: TeamsTableData) => Promise<void>
    editTeamData: (team: TeamsTableData) => void;
    handleTeamDelete: (team: TeamsTableData) => Promise<void>
    handleAddMemberModal: () => void
    handleCloseMemberModal: () => void
    selectedMembers: EmployeeTableData[]
    setSelectedMembers: (members: EmployeeTableData[]) => void
    removeMember: (member: EmployeeTableData) => void
    getTeamById: (teamId: number) => Promise<TeamsTableData>
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

    const mapTeam = (team: any): TeamsTableData => ({
        teamId: team.team_id,
        teamName: team.team_name,
        teamDescription: team.team_description,
        teamLeadId: team.team_lead_id || undefined,
        teamLeadName: team.team_lead_name || "",
        teamMembers: (team.team_members || []).map((member: any) => ({
            id: member.id,
            employeeCode: member.employee_code,
            name: member.name,
        })),
    });

    const buildTeamUpdatePayload = (original: TeamsTableData | undefined, updated: TeamsTableData) => {
        const payload: { team_name?: string; team_description?: string; team_lead_id?: number | null; member_ids?: number[] } = {};

        if (!original) {
            payload.team_name = updated.teamName || "";
            payload.team_description = updated.teamDescription || "";
            payload.team_lead_id = updated.teamLeadId ?? null;
            payload.member_ids = (updated.teamMembers || []).map((member) => member.id).filter((id): id is number => typeof id === 'number');
            return payload;
        }

        if (updated.teamName !== original.teamName) {
            payload.team_name = updated.teamName || "";
        }

        if (updated.teamDescription !== original.teamDescription) {
            payload.team_description = updated.teamDescription || "";
        }

        if (updated.teamLeadId !== original.teamLeadId) {
            payload.team_lead_id = updated.teamLeadId ?? null;
        }

        const originalMemberIds = (original.teamMembers || []).map((member) => member.id).filter((id): id is number => typeof id === 'number');
        const updatedMemberIds = (updated.teamMembers || []).map((member) => member.id).filter((id): id is number => typeof id === 'number');

        // Send only the changed IDs (added + removed)
        const originalSet = new Set(originalMemberIds);
        const updatedSet = new Set(updatedMemberIds);
        
        const added = updatedMemberIds.filter(id => !originalSet.has(id));
        const removed = originalMemberIds.filter(id => !updatedSet.has(id));
        
        const changedIds = [...added, ...removed];
        
        if (changedIds.length > 0) {
            payload.member_ids = changedIds;
        }

        return payload;
    };

    useEffect(() => {
        const loadTeams = async () => {
            try {
                const data = await fetchTeamsTableData();
                setTeamList(data.map(mapTeam));
            } catch (error) {
                console.error(error);
            }
        }

        const loadEmployees = async () => {
            try {
                const data = await fetchEmployeesForTeams()
                setEmployeeList(
                    data.map((emp) => ({
                        id: emp.id,
                        employeeCode: emp.employee_code,
                        name: emp.name,
                    }))
                )
            } catch (error) {
                console.log(error)
            }
        }

        loadTeams()
        loadEmployees()

    }, []);


    const addTeam = async (team: TeamsTableData) => {
        const created = await createTeam({
            team_name: team.teamName || "",
            team_description: team.teamDescription || "",
            team_lead_id: team.teamLeadId || null,
            member_ids: (team.teamMembers || []).map((member) => member.id as number),
        });
        setTeamList((prev) => [...prev, mapTeam(created)]);
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

    const updateTeam = async (updatedTeam: TeamsTableData) => {
        if (!updatedTeam.teamId) return;
        const originalTeam = teamList.find((team) => team.teamId === updatedTeam.teamId);
        const payload = buildTeamUpdatePayload(originalTeam, updatedTeam);
        
        // Filter out undefined values from payload
        const cleanPayload = Object.fromEntries(
            Object.entries(payload).filter(([, value]) => value !== undefined)
        ) as TeamUpdatePayload;
        
        if (Object.keys(cleanPayload).length === 0) {
            setSuccessfullModal(true);
            document.body.style.overflow = "hidden";
            window.scrollTo(0, 0);
            setIdExistError("");
            return;
        }

        const saved = await updateTeamById(updatedTeam.teamId, cleanPayload);
        const mappedTeam = mapTeam(saved);
        const updatedList = teamList.map((team) =>
            team.teamId === mappedTeam.teamId ? mappedTeam : team
        );
        console.log("updateList", updatedList)
        setTeamList(updatedList);
        setSuccessfullModal(true);
        document.body.style.overflow = "hidden";
        window.scrollTo(0, 0);
        setIdExistError("");
    };

    const handleTeamDelete = async (team: TeamsTableData) => {
        if (!team.teamId) return;
        await deleteTeamById(team.teamId);
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

    const getTeamById = async (teamId: number) => {
        const data = await fetchTeamById(teamId);
        return mapTeam(data);
    }


    return (
        <TeamsContext.Provider value={{ teamList, employeeList, setEditingTeam, editingTeam, handleTeamDelete, addTeam, updateTeam, editTeamData, idExistError, setIsDeleteTeamModal, isDeleteTeamModal, setSuccessfullModal, successfullModal, clearError, handleAddMemberModal, isOpenMembersModal, setIsOpenMembersModal, handleCloseMemberModal, selectedMembers, setSelectedMembers, removeMember, getTeamById }}>
            {children}
        </TeamsContext.Provider>
    );
};
