# Frontend: Teams Feature

**Location**: `src/features/teams/`

## Files

| File | Description |
|------|-------------|
| `modal/teamsContext.tsx` | Context provider, state, CRUD actions (note: lowercase filename) |
| `api/teams.ts` | Data fetching from dummy JSON |
| `ui/TeamsBody.tsx` | Teams list page |

## Data Interfaces

### `TeamsTableData`
```typescript
{
  teamId?: number;
  teamName?: string;
  teamDescription?: string;
  teamLeadId?: number;
  teamLeadName?: string;
  teamMembers?: EmployeeTableData[];  // Embedded array, not a flat FK
  companyId?: number;                  // Frontend-only
  companyName?: string;                // Frontend-only
}
```

### `EmployeeTableData` (local to teams)
```typescript
{
  id?: string;
  name?: string;
}
```
Simplified version of the employee interface — only `id` and `name`, used for member selection.

## Cross-Feature Dependency

TeamsContext imports `fetchEmploeeTableData` from **`features/dashboard/api/dashboard`** (NOT from the employees feature). This loads the employee list for the member selection modal.

**Type mismatch**: The dashboard API defines its own `EmployeeTableData` as `{ name: string; status: string }`, but the teams context defines a local `EmployeeTableData` as `{ id?: string; name?: string }`. The fetch function returns the dashboard shape, but the context stores it as the local shape. The `id` field may be missing from the fetched data.

## Context API (`useTeams()`)

### State
| State | Type | Description |
|-------|------|-------------|
| `teamList` | `TeamsTableData[]` | All teams |
| `employeeList` | `EmployeeTableData[]` | All employees (for member selection) |
| `editingTeam` | `TeamsTableData \| null` | Currently editing |
| `selectedMembers` | `EmployeeTableData[]` | Members selected in modal |
| `isOpenMembersModal` | `boolean` | Member selection modal visible |
| `isDeleteTeamModal` | `TeamsTableData \| null` | Delete confirmation |
| `idExistError` | `string` | Error message |
| `successfullModal` | `boolean` | Show success modal |

### Actions
| Action | Behavior |
|--------|----------|
| `addTeam(team)` | Appends to list, clears `selectedMembers` |
| `updateTeam(team)` | Replaces by `teamId` match |
| `editTeamData(team)` | Sets editing state, loads `teamMembers` into `selectedMembers` |
| `handleTeamDelete(team)` | Filters out by `teamId` |
| `handleAddMemberModal()` | Opens member selection modal, syncs `selectedMembers` from `editingTeam` |
| `handleCloseMemberModal()` | Closes modal, writes `selectedMembers` back into `editingTeam.teamMembers` |
| `removeMember(member)` | Filters member out of `selectedMembers` by `id` |

## API Layer
- `fetchTeamsTableData()` -> `/dummy_json_data/teams_json_data/teamsTable.json`

## Routes
| Path | Component |
|------|-----------|
| `/teams` | TeamPage |
| `/teams/new-team` | NewTeamPage |
| `/teams/update-team/:teamId` | UpdateTeamsPage |
