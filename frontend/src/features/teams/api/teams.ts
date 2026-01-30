export interface TeamsTableData {
    teamId: number,
    teamName: string,
    teamDescription: string,
    teamLeadId: number,
    teamLeadName: string,
    teamMemebers: [],
    companyId: number,
    companyName: string
}

export interface TeamsListData {
    teamsAllList: TeamsTableData[]
}


export const fetchTeamsTableData = async (): Promise<TeamsListData> => {
    try {
        const response = await fetch(
            "/dummy_json_data/teams_json_data/teamsTable.json"
        );
        if (!response.ok) {
            throw new Error(`${response.status}`);
        }
        const data = await response.json();
        return { teamsAllList: data.teamsTable };
    } catch (error) {
        console.error(error);
        throw error;
    }
};

