<template>
	<v-card
		:disabled="disabled"
		:flat="flat"
		class="qd-datepicker"
		:class="{ 'main-container pa-4': !flat }"
		:style="style"
		v-bind="$attrs"
	>
		<div class="font-weight-medium text--secondary">{{ labels.year }}</div>
		<v-text-field
			:value="year"
			class="pt-0"
			:color="color"
			:placeholder="currentYear"
			hide-details
			type="number"
			@input="(e) => updateYear(e)"
		/>
		<div class="font-weight-medium text--secondary my-3">{{ labels.month }}</div>
		<v-row class="qd-months" dense>
			<v-col v-for="i in 12" :key="`qd-month-col-${i}`" cols="2">
				<v-btn
					:key="`qd-month-${i}`"
					class="qd-month pa-0"
					:class="{ 'white--text': i - 1 === month }"
					:color="i - 1 === month ? color : ''"
					block
					:disabled="disabled"
					elevation="0"
					small
					@click="updateMonth(i)"
				>
					{{ upperMonths[i - 1] }}
				</v-btn>
			</v-col>
		</v-row>
		<div class="font-weight-medium text--secondary my-3">{{ labels.day }}</div>
		<div class="qd-days">
			<v-btn
				v-for="i in 31"
				:key="`qd-day-${i}`"
				class="qd-day px-0"
				:class="{ 'white--text': i === day }"
				:color="i === day ? color : ''"
				:text="i !== day"
				:elevation="i === day ? 2 : 0"
				:disabled="disabled || i > daysInCurMonth"
				@click="updateDay(i)"
			>
				{{ i }}
			</v-btn>
		</div>
	</v-card>
</template>

<script>
export default {
	name: "quick-date-picker",
	props: {
		months: {
			type: Array,
			required: true,
		},
		value: {
			// anything that can go into the Date constructor
			type: [Number, String, Date],
			required: true,
		},
		disabled: {
			type: Boolean,
			required: false,
			default: () => false,
		},
		flat: {
			type: Boolean,
			required: false,
			default: false,
		},
		labels: {
			type: Object,
			required: false,
			default: () => ({ year: "Year", month: "Month", day: "Day" }),
		},
		block: {
			type: Boolean,
			required: false,
			default: false,
		},
		color: {
			type: String,
			required: false,
			default: "primary",
		},
	},
	emits: ["input"],
	data() {
		return {
			date: new Date(new Date(this.value).setHours(0, 0, 0, 0)),
			// presumably the year isn't changing while using the page (lol)
			currentYear: String(new Date().getFullYear()),
		};
	},
	computed: {
		style() {
			return this.block ? "width: 100%" : "width: 290px; max-width: 100%";
		},
		day() {
			return this.date.getDate();
		},
		month() {
			return this.date.getMonth();
		},
		year() {
			return this.date.getFullYear();
		},
		daysInCurMonth() {
			return this.daysInMonth(this.year, this.month + 1);
		},
		upperMonths() {
			return this.months.map((name) => name.toTitleCase());
		},
	},
	methods: {
		checkAndMaxDate(year, month) {
			const newDate = new Date(year, month - 1, this.day);
			if (newDate.getDate() != this.day) {
				const daysInNewMonth = this.daysInMonth(year, month);
				const newDay = Math.min(this.day, daysInNewMonth);
				const correctedDay = new Date(new Date(year, month - 1, newDay).setHours(0, 0, 0, 0));
				this.date = correctedDay;
			}
		},
		updateDay(i) {
			this.date.setDate(i);
			this.date = new Date(this.date);
		},
		updateMonth(m) {
			this.checkAndMaxDate(this.year, m);
			this.date.setMonth(m - 1);
			this.date = new Date(this.date);
		},
		updateYear(e) {
			const parsed = Number.parseInt(e);
			const newYear = Number.isNaN(parsed) ? this.year : parsed;

			this.checkAndMaxDate(newYear, this.month + 1);
			this.date.setFullYear(newYear);
			this.date = new Date(this.date);
		},
		daysInMonth(year, monthIndex) {
			return new Date(year, monthIndex, 0).getDate();
		},
	},
	watch: {
		value: {
			handler(n, o) {
				if (new Date(n).getTime() !== new Date(o).getTime()) this.date = new Date(n);
			},
			immediate: true,
			deep: true,
		},
		date() {
			this.$emit("input", this.date.getTime());
		},
	},
};
</script>

<style lang="scss">
.qd-month {
	text-transform: none !important;
}

.qd-days {
	display: grid;
	grid-template-columns: repeat(7, 1fr);
	grid-gap: 4px;
}

.qd-days > * {
	aspect-ratio: 1;
	max-height: 32px;
}
.qd-day {
	min-width: auto !important;
	width: 100% !important;
	height: 100% !important;
}
</style>
