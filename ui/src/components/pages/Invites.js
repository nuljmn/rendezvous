import React, { Component, useState } from 'react';
import { useStore } from '../../data/store';
import { Text, Box, Button } from "@tlon/indigo-react";
import { filterDistantInvites, fetchMyInvites, fetchReceivedShips, fetchMyReceivedShip } from '../../utils';
import FocusedInvite from './FocusedInvite';
import { getDistance } from 'geolib';
import haversine from 'haversine-distance';
import { useAlert } from 'react-alert'

const Actions = (props) => {
	const pBan = useStore(state => state.pBan);
	const pUnban = useStore(state => state.pUnban);
	const pAccept = useStore(state => state.pAccept);
	const pDeny = useStore(state => state.pDeny);
	const pCancel = useStore(state => state.pCancel);
	const pClose = useStore(state => state.pClose);
	const pReopen = useStore(state => state.pReopen);
	const pComplete = useStore(state => state.pComplete);
	const pEditDesc = useStore(state => state.pEditDesc);
	const pEditInvite = useStore(state => state.pEditInvite);
	const alert = useAlert()
	const invite = props.invite.invite;

	if(invite.initShip === '~' + window.urbit.ship) {
		return (
			<Box>
			{ invite.hostStatus === "sent" &&
				<Box display='flex'>
					<Button onClick={()=>{
						pClose(props.invite.id);
						alert.show('Closed: no more RSVPs will be accepted');
					}}>Close</Button>
					<Button onClick={()=>{
						pCancel(props.invite.id);
						alert.show('Cancelled: this invite has been revoked from all invitees');
					}}>Cancel</Button>
				</Box>
			}
			{ invite.hostStatus === "closed" &&
				<Box display='flex'>
				<Button onClick={()=>{
					pReopen(props.invite.id);
					alert.show('Reopened: accepting RSVPs again');
				}}>Reopen</Button>
				<Button onClick={()=>{
					pComplete(props.invite.id)
					alert.show('Gathering Complete');
				}}>Complete</Button>
				<Button onClick={()=>{
					pCancel(props.invite.id)
					alert.show('Invite Trashed');
				}}>Delete</Button>
				</Box>
			}
			{ invite.hostStatus === "completed" &&
				<Box display='flex'>
				<Button onClick={()=>{
					pCancel(props.invite.id)
					alert.show('Invite Trashed');
				}}>Delete</Button>
				</Box>
			}
			</Box>
	)}
	else {
		const inviteeStatus = fetchMyReceivedShip(invite).shipInvite;
		// console.log(fetchMyReceivedShip(props.invite));
		// const inviteeStatus = 'pending';
		console.log(inviteeStatus);
		if (invite.hostStatus === 'sent') {
			return (
				<Box>
				{inviteeStatus}
				{ inviteeStatus === 'pending' &&
				<Box>
					<Button onClick={() => {
						pAccept(props.invite.id)
						alert.show('RSVP sent to host');
						}}> RSVP </Button>
					<Button onClick={() => {
						pBan(invite.initShip)
						alert.show('You will no longer send or receive invites to/from the host ship');
						}} > Ban </Button>
				</Box>
				}
				{ inviteeStatus === 'accepted' &&
				<Box>
					<Button onClick={() => {pDeny(props.invite.id)}}> UnRSVP? </Button>
				</Box>
				}
				</Box>
			)
		}
		else if (invite.hostStatus === 'closed') {
			return (
				<Box>
					{inviteeStatus}
				{ inviteeStatus === 'pending' &&
				<Box>
					<Button onClick={() => {pAccept(props.invite.id)}}> RSVP </Button>
					<Button onClick={() => {pBan(invite.initShip)}} > Ban </Button>
				</Box>
				}
				{ inviteeStatus === 'accepted' &&
				<Box>
					<Button onClick={() => {
					alert.show('Revoked RSVP');
					pDeny(invite.id)
					}}> UnRSVP </Button>
				</Box>
				}
				</Box>
			)
		}
		else {
			return (
				<Box>
					{inviteeStatus}
					<Button onClick={()=>{
						alert.show('Invite Trashed');
						pCancel(props.invite.id)
						}}>Delete (TODO)</Button>
					<Button onClick={() => {pBan(invite.initShip)}} > Ban </Button>
				</Box>
			)
		}
	}

	return (<h1></h1>);
}

const Date = (props) => {
	// invite.date
	return (
		<Box>
		<Text> Date </Text>
		<Text> Time </Text>
		</Box>
	);
}

const Status = (props) => {
		switch (props.invite.hostStatus) {
			case 'sent':
			return (
				<Box 
					pl={5}
					minWidth={150}
				>
				<Text color='blue'>Sent</Text>
				</Box>
			)
			break;
			case 'closed':
			return (
				<Box 
					pl={5}
					minWidth={150}
				>
				<Text color='blue'>Closed</Text>
				</Box>
			)
			break;
			case 'completed':
			return (
				<Box 
					pl={5}
					minWidth={150}
				>
				<Text color='green'>Completed</Text>
				</Box>
			)
			break;
		}
}

const Invite = (props) => {
	const route = useStore(state => state.route);
	const settings = useStore(state => state.settings);
	// const focusedInvite = useStore(state => state.focusedInvite);
	// const focusInvite = useStore(state => state.focusInvite);
	const [focusedInvite, focusInvite] = useState({});

	if(Object.keys(focusedInvite).length === 0)
		return (
				<Box>
					{ props.invites.map( mInvite => {
						const id = mInvite.id;
						const invite = mInvite.invite;
						return (
					<Box 
						border={1}
						// justifyContent='center'
						alignItems='center'
					//	p={2}
						m={2}
						display='flex'
					>
						<Status invite={invite}/>
						{/* <Box borderBottom={1}> */}
						<Box 
							pr={50}
							width='100%'
						>
						<Text>From {invite.initShip} </Text>
						</Box>
						{/* <Box borderBottom={1}> */}
						{/* <Box> */}
						{/* <Text>{invite.desc}</Text> */}
						{/* </Box> */}
						{/* <Box> */}
						{/* 		{ invite.locationType === "meatspace" && */} 
						{/* 			<Text>Location: {invite.address}</Text> */}
						{/* 		} */}
						{/* </Box> */}
						{/* {  invite.initShip !== '~' + window.urbit.ship && */}
						{/* <Box border={1}> */}
						{/* <Text>Your distance from the invite location:</Text> */}
						{/* <br/> */}
						{/* { haversine( */}
						{/* 	{ latitude: invite.position.lat, longitude: invite.position.lon }, */}
						{/* 	{ latitude: settings.position.lat, longitude: settings.position.lon }, */}
						{/* ) + '  meters'} */}
						{/* </Box> */}
						{/* } */}
						{/* <Box> */}
						{/* 	<Text> */}
						{/* 		Access link: {invite.accessLink} */}
						{/* 	</Text> */}
						{/* </Box> */}
						{/* { invite.radius !== 0 && */}
						{/* <Box> */}
						{/* 	<Text> */}
						{/* 		Delivery radius: {invite.radius} */}
						{/* 	</Text> */}
						{/* </Box> */}
						{/* } */}
						{/* { invite.maxAccepted !== 0 && */}
						{/* <Box> */}
						{/* 	<Text> {invite.receiveShips.filter(x => x.shipInvite === 'accepted').length} / {invite.maxAccepted} RSVP'd </Text> */}
						{/* </Box> */}
						{/* } */}
						<Box 
							display='flex'
							right='0'
						>
						<Button onClick={() => {console.log(invite); focusInvite(mInvite)}}>Inspect</Button>
						<Actions invite={mInvite}/>
						</Box>
						</Box>
						)})}
				</Box>
			)
	else
		return (
			<FocusedInvite invite={focusedInvite} focusInvite={focusInvite}/>
		)
};

const InviteSorter = (inviteRoute) => {
	return (
		<Box
			display='flex'
		>
		{ inviteRoute === 'all' &&
			<Box>
				{/* <Button> */} 
			</Box>
		}
		</Box>
	)
}

const Invites = () => {
	const inviteRoute = useStore(state => state.inviteRoute);
	const settings = useStore(state => state.settings);
	const all = useStore(state => state.invites);
	const hosting = useStore(state => fetchMyInvites(state.invites));
	const received = useStore(state => fetchReceivedShips(state.invites));
	switch(inviteRoute) {
		case "all":
			return (
				<Box>
					<Text>All</Text>
				<Invite invites={filterDistantInvites(all, settings)}/>
				</Box>
			);
		break;
		case "hosting":
			return (
				<Invite invites={filterDistantInvites(hosting, settings)}/>
			);
		break;
		case "received":
			return (
				<Invite invites={filterDistantInvites(received, settings)}/>
			);
		break;
	}
}

export default Invites;
