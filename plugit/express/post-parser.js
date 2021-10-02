const fs = require('fs')
const moment = require('moment')
const express = require('express')
const formidable = require('express-formidable')
const { fileUploader, skipableMids, Cron } = require('#/utils')

const storageTempUploadFolder = 'storage/tmp'

const checkRequest = (req, contentType) => {
	if (req.method == 'GET') return false
	if (!req.headers['content-type']) return false
	return req.headers['content-type'].toLowerCase().startsWith(contentType)
}

const postParser = () => [
	skipableMids(
		(req, res, next, skip) => {
			if (checkRequest(req, 'multipart/form-data')) next()
			else skip()
		},
		formidable({
			multiples: false,
			uploadDir: storageTempUploadFolder,
		}),
		(req, res, next) => {
			req.body = JSON.parse(req.fields.data_json || null) || {}
			delete req.fields
			let files = {}
			for (let file in req.files || {}) {
				let m = file.match(/^(.+)\[\]$/)
				if (m) {
					files[m[1]] = [].concat(req.files[m[0]])
				} else {
					files[file] = req.files[file]
				}
			}
			req.files = files
			req.uploadFile = fileUploader(req.files)
			next()
		}
	),
	skipableMids((req, res, next, skip) => {
		if (checkRequest(req, 'application/json')) next()
		else skip()
	}, express.json({ limit: '50mb' })),
]

Cron.create('Storage.cleanTempUploadFiles', {
	title: 'Borrar archivos temporales de uploads',
	cronTime: '0 0 6 * * *',
	onTick: () => {
		let now = moment()
		let files = fs.readdirSync(storageTempUploadFolder)
		for (let file of files) {
			if (file == '.empty') continue
			let filepath = `${storageTempUploadFolder}/${file}`
			fs.stat(filepath, (err, stats) => {
				if (err) return
				let diff = now.diff(stats.birthtime, 'days')
				if (diff >= 1) fs.unlinkSync(filepath)
			})
		}
	},
})

module.exports = postParser
