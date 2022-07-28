const { readdirSync } = require('fs')
const { Permissions } = require('discord.js')
const { errorEmbed, customEmbed } = require(`./embed`)
const { redTick, red, errorImage } = require(`./config.json`)

//? Fetch all JS files function.
function getFiles(dir) {
	const files = readdirSync(dir, {
		withFileTypes: true,
	})
	let commandFiles = []
	for (const file of files) {
		if (file.isDirectory()) {
			commandFiles = [...commandFiles, ...getFiles(`${dir}/${file.name}`)]
		} else if (file.name.endsWith('.js')) {
			commandFiles.push(`.${dir}/${file.name}`)
		}
	}
	return commandFiles
}
//? Command coolDown function.
function coolDown(interaction, collection, userID, client) {
	if (client.coolDowns.has(userID)) {
		let timeWord
		let coolDownTime
		if (collection.coolDown >= 60000) {
			if (collection.coolDown == 60000) timeWord = 'minute'
			else timeWord = 'minutes'
			coolDownTime = collection.coolDown / 60000
		} else {
			if (collection.coolDown == 1000) timeWord = 'second'
			else timeWord = 'seconds'
			coolDownTime = collection.coolDown / 1000
		}
		interaction.reply({
			embeds: [
				customEmbed(
					`You are on a \`${coolDownTime}\` ${timeWord} coolDown.`,
					red,
					redTick
				),
			],
			allowedMentions: { repliedUser: false }
		})
		return true
	} else {
		client.coolDowns.set(userID)
		setTimeout(() => {
			client.coolDowns.delete(userID)
		}, collection.coolDown)
	}
}
//? Command permissions function.
function permissions(interaction, collection) {
	if (collection.permissions && collection.permissions.length) {
		let invalidPermissionsFlags = []
		for (const permission of collection.permissions) {
			if (!interaction.member.permissions.has(Permissions.FLAGS[permission])) {
				invalidPermissionsFlags.push(permission)
			} else {
				return false
			}
		}
		errorEmbed(interaction, `You do not have the \`${invalidPermissionsFlags}\` permissions.`)
		return true
	}
}
module.exports = { getFiles, coolDown, permissions }
