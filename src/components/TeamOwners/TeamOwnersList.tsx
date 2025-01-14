import {
    IonList,
    IonItem,
    IonLabel,
    IonText,
    IonButton,
    IonToolbar,
    IonButtons,
    IonIcon,
    IonTitle,
    IonContent, IonInput, IonModal, IonSearchbar, useIonActionSheet
} from '@ionic/react';

import './TeamOwnersList.css';

import React, {useContext, useState} from "react";
import {closeOutline as closeIcon, ellipsisHorizontal as menuIcon} from "ionicons/icons";
import {useTranslation} from "react-multi-lang";
import {AppContext} from "../../State";
import ConfirmPrompt from "../ConfirmPrompt";
import TeamEditor from "./TeamEditor";
import {removeTeamOwnerTeam} from "../../api/TeamOwners";

type TeamOwnersListProps = {
    teamOwners?: Array<{name?: string; digital_id:number}>;
    isTeam?: boolean;
    showTeamActions?: boolean;
    addTeams?: (payload:{}) => void;
    fetchTeamOwner?: () => void;
};

const TeamOwnersList: React.FC<TeamOwnersListProps> = ({teamOwners, isTeam = false, showTeamActions = false, addTeams, fetchTeamOwner}) => {
    const t = useTranslation();
    const {state} = useContext(AppContext);
    const [showAddModal, setShowAddModal] = useState<boolean>(false);
    const [showEditModal, setShowEditModal] = useState<any>(false);
    const [teams, setTeams] = useState<string[]>([""]);
    const [search, setSearch] = useState<string>("");
    const [showDeleteModal, setShowDeleteModal] = useState<any>(false);
    const [present, dismiss] = useIonActionSheet();

    const hideAddModal = async () => {
        setTeams([""]);
        setShowAddModal(false);
    }

    const onRemoveTeam = async (teamId:string) => {
        const response = await removeTeamOwnerTeam(teamId);
        if (response.success) {
            fetchTeamOwner && fetchTeamOwner();
        }
    }

    const Submit = async () => {
        addTeams && addTeams(teams.filter(t => t));
        hideAddModal();
    }

    return (<>
        <IonList className="teamOwnersList user-profile-notes-tab">
            <IonSearchbar className="searchbar" placeholder={isTeam ? t('teams.search_owners') : t('teams.search_teams')} value={search} onIonChange={e => {setSearch(e.detail.value!);}} />
            {addTeams && <div className="user-profile-section">
                <IonButton fill="clear" onClick={() => setShowAddModal(true)}>{t('teams.add')}</IonButton>
                <IonModal isOpen={!!showAddModal} onDidDismiss={() => hideAddModal()} cssClass="add-note-modal">
                    <IonToolbar className="modal-header">
                        <IonButtons slot="start"><IonIcon size="large" icon={closeIcon} slot="start" onClick={() => hideAddModal()} /></IonButtons>
                        <IonTitle className="page-title">{t('teams.add_team')}</IonTitle>
                    </IonToolbar>
                    <IonContent>
                        <div className="add-note-wrapper">
                            <div>
                                <IonText className="add-note-title">{t('teams.team_name')}</IonText>
                                {teams.map((team, index) => (<div className="team-input-wrapper" key={index}>
                                    <IonText className="team-index">{index + 1}</IonText>
                                    <IonInput key={index} className="add-note-input" placeholder={t('teams.team_name')} value={team} onIonChange={(e) => setTeams(teams.map((t, ti) => ti === index ? e.detail.value! : t))} />
                                </div>))}
                                <IonButton fill="outline" className="add-team-input-button" onClick={() => setTeams([...teams, ""])}>{t('teams.add_another_team')}</IonButton>
                            </div>
                            <IonButton disabled={teams.length <= 0} expand="block" className="split-button" onClick={Submit}><div><p>{t('teams.teams')}: {teams.length}</p><p>{t('teams.submit')}</p></div></IonButton>
                        </div>
                    </IonContent>
                </IonModal>
            </div>}
            {teamOwners?.filter(t => t.name?.toLowerCase().includes(search.toLowerCase()) || (""+t.digital_id)
                .includes(search.replace('-','')))
                .sort((a:any, b:any) => a.name > b.name ? 1 : -1)
                .map((teamOwner:any, index:number) => {
                return <IonItem key={teamOwner.id} lines="none" className="teamOwner" button={!isTeam} routerLink={!isTeam ? "/team_owner/"+teamOwner.id : "/team_owner/"+teamOwner.team_owner_id}>
                    <p className="teamOwner-index">{index + 1}</p>
                    <IonLabel className="teamOwner-short-info">
                        <IonText className="teamOwner-short-info_name" color={teamOwner.name.toLowerCase().replace(/\s+/g, '')}>{teamOwner.name}</IonText>
                        <IonText className="teamOwner-short-info_winrate digital-id-small">ID {(""+teamOwner.digital_id).substr(0, 3)+"-"+(""+teamOwner.digital_id).substr(3, 3)}</IonText>
                        {isTeam ?
                            <>
                                <IonText className="teamOwner-short-info_winrate">{Math.max(0, teamOwner.wins)} {t('teams.wins')} • {Math.max(0, teamOwner.draws)} {t('teams.draws')} • {Math.max(0, teamOwner.loses)} {t('teams.loses')} • {Math.min(100, Math.max(0, Math.round(teamOwner.wins / Math.max(1, (teamOwner.wins || 0) + (teamOwner.draws || 0) + (teamOwner.loses || 0)) * 100)))}%</IonText>
                            </> :
                            <IonText className="teamOwner-short-info_winrate">{teamOwner.teams?.length || 0} {t('teams.teams')}</IonText>
                        }
                    </IonLabel>
                    {(isTeam && showTeamActions && (state.user?.role === "admin" || state.user?.role === "admin_manager" || state.user.role === "stadium_admin_worker")) && <IonIcon size="large" className="view-note-menu" icon={menuIcon} onClick={() => present({
                        buttons: [
                            { text: t('teams.edit'), handler: () => setShowEditModal(teamOwner) },
                            { text: t('teams.delete'), handler: () => setShowDeleteModal(teamOwner.id) },
                            { text: t('teams.cancel'), handler: () => dismiss(), cssClass: 'action-sheet-cancel'}
                        ],
                        header: teamOwner.name
                    })} />}
                </IonItem>
            })}
        </IonList>
        <ConfirmPrompt
            data={showDeleteModal}
            show={!!showDeleteModal}
            title={t('teams.team_delete_confirm_title')}
            subtitle={t('teams.team_delete_confirm_subtitle')}
            onResult={(data, isConfirmed) => {isConfirmed && onRemoveTeam(data); setShowDeleteModal(false)}}
        />
        <IonModal isOpen={!!showEditModal} onDidDismiss={() => setShowEditModal(false)}>
            <TeamEditor team={showEditModal} fetchTeamOwner={() => fetchTeamOwner && fetchTeamOwner()} close={() => setShowEditModal(false)}/>
        </IonModal>
    </>);
};

export default TeamOwnersList;
