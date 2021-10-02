<script>
let requireView = require.context('@/admin', true, /.+\/view_[\w-]+\.vue$/)
let views = {}
for (let file of requireView.keys()) {
	let view = requireView(file).default
	views[view.name] = view
}

export default {
	name: 'App',
	metaInfo() {
		let title = this.$store.get('app/title')
		title = title ? `${title} | Admin` : 'Admin'
		return { title }
	},
	data() {
		return {
			loader: {
				visible: false,
			},
			dialog: {
				visible: false,
			},
			routerReady: false,
		}
	},
	methods: {
		loading(visible, title, text) {
			this.loader.visible = visible
			this.$set(this.loader, 'title', title)
			this.$set(this.loader, 'text', text)
		},
		showDialog({ type, title, text, description, code, accept, cancel, onAccept, onCancel }) {
			this.dialog.visible = true
			this.$set(this.dialog, 'type', type)
			this.$set(this.dialog, 'title', title)
			this.$set(this.dialog, 'text', text)
			this.$set(this.dialog, 'description', description)
			this.$set(this.dialog, 'code', code)
			this.$set(this.dialog, 'accept', accept)
			this.$set(this.dialog, 'cancel', cancel)
			let on = {}
			if (onAccept) on.accepted = onAccept
			if (onCancel) on.canceled = onCancel
			this.$set(this.dialog, 'on', on)
		},
	},
	provide() {
		return {
			appLoading: this.loading,
			showDialog: this.showDialog,
		}
	},
	beforeCreate() {
		this.$adminApi.defaults({
			loader: true,
			loading: (...args) => this.loading(...args),
			onMessage: ({ message }) => {
				console.log(message)
				this.showDialog(message)
			},
			onConfirm: ({ confirmed, canceled, options }) => {
				this.showDialog({
					title: options.confirm.title,
					text: options.confirm.text,
					onAccept: confirmed,
					onCancel: canceled,
					accept: options.confirm.accept,
					cancel: options.confirm.cancel,
				})
			},
		})
	},
	async created() {
		this.loading(true, 'Iniciando')
		let { data } = await this.$adminApi.get('/main-data', {
			loader: false,
		})

		this.$store.set('app/admin', data.admin)
		this.$store.set('app/routes', data.routes)
		this.$store.set('app/initialized', true)

		for (let { pages } of data.routes) {
			for (let page of pages) {
				this.$router.addRoute({
					name: page.key,
					path: page.path,
					component: views[page.viewComponent],
				})
			}
		}

		if (this.$route.path == '/') {
			await this.$router.replace({ name: data.routes[0].pages[0].key })
		}

		this.routerReady = true
		setTimeout(() => {
			this.loading(false)
		}, 750)
	},
}
</script>

<template>
	<v-app>
		<template v-if="routerReady">
			<AppBar />
			<Drawer />
			<v-main>
				<v-container fluid class="px-4 px-md-8 pb-8">
					<router-view />
				</v-container>
			</v-main>
		</template>
		<FullLoaderOverlay v-bind="loader" />
		<AppMessageDialog v-bind="dialog" v-model="dialog.visible" v-on="dialog.on" />
	</v-app>
</template>

<style>
#app {
	background-color: #f8f8f8;
	/*font-family: 'Girassol', cursive !important;*/
}
</style>
