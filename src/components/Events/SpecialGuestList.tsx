import {
    IonList,
    IonItem,
    IonLabel,
    IonText, IonSearchbar
} from '@ionic/react';

import '../TeamOwners/TeamOwnersList.css';

import React, {useState} from "react";

type TeamOwnersListProps = {
    teamOwners?: Array<{name?: string; digital_id:number}>;
    isTeam?: boolean;
    addTeams?: (payload:{}) => void;
    selectedTeamOwners?: [];
    setSelectedTeamOwners?: (selected:any) => void;
};

const SpecialGuestList: React.FC<TeamOwnersListProps> = ({teamOwners, isTeam = false, selectedTeamOwners = [], setSelectedTeamOwners}) => {
    const [search, setSearch] = useState<string>("");

    return (<IonList className="teamOwnersList user-profile-notes-tab">
        <IonSearchbar className="searchbar" placeholder={"Search names"} value={search} onIonChange={e => {setSearch(e.detail.value!);}} />
        {teamOwners?.filter(t => t.name?.toLowerCase().includes(search.toLowerCase()) || t.digital_id == +search ).map((teamOwner:any, index:number) => {
            return <IonItem key={teamOwner.id} lines="none" className={selectedTeamOwners.find((sto:any) => sto.id === teamOwner.id) ? "teamOwner specialGuest selected" : "teamOwner specialGuest"} onClick={() =>
                setSelectedTeamOwners && (selectedTeamOwners.find((sto:any) => sto.id === teamOwner.id) ? setSelectedTeamOwners(selectedTeamOwners.filter((sto:any) => sto.id !== teamOwner.id)) : setSelectedTeamOwners([...selectedTeamOwners, teamOwner]))
            }>
                <p className="teamOwner-index">{index + 1}</p>
                <IonLabel className="teamOwner-short-info">
                    <IonText className="teamOwner-short-info_name" color={teamOwner.name.toLowerCase().replace(/\s+/g, '')}>{teamOwner.name}</IonText>
                    <IonText className="teamOwner-short-info_winrate">{teamOwner.teams?.length || 0} Teams</IonText>
                </IonLabel>
            </IonItem>
        })}
    </IonList>);
};

export default SpecialGuestList;
