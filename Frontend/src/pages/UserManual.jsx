import { useMemo, useState } from "react";
import {
	AlertTriangle,
	Bell,
	BookOpen,
	CheckCircle2,
	ChevronDown,
	LayoutDashboard,
	LifeBuoy,
	LineChart,
	Mail,
	Search,
	Settings,
	Smartphone,
	User,
	Wifi,
	Wrench,
	XCircle,
	Zap,
} from "lucide-react";
import "../styles/UserManual.css";

const quickNav = [
	{ id: "intro", title: "Introduction", icon: BookOpen },
	{ id: "getting-started", title: "Getting Started", icon: Zap },
	{ id: "dashboard", title: "Dashboard", icon: LayoutDashboard },
	{ id: "devices", title: "Devices Guide", icon: Smartphone },
	{ id: "alerts", title: "Alerts", icon: Bell },
	{ id: "settings", title: "Settings", icon: Settings },
	{ id: "metrics", title: "Metrics", icon: LineChart },
	{ id: "troubleshooting", title: "Troubleshooting", icon: Wrench },
	{ id: "faq", title: "FAQ", icon: LifeBuoy },
	{ id: "support", title: "Support", icon: Mail },
];

const gettingStartedSteps = [
	{
		title: "Sign up or login",
		details: "Create your account, verify credentials, and access your personalized dashboard.",
	},
	{
		title: "Add your first device",
		details: "Open Devices page and register a device with name, room, and category.",
	},
	{
		title: "Connect via WiFi/network",
		details: "Pair device on the same network and confirm online status in real time.",
	},
	{
		title: "Start monitoring",
		details: "Track power, energy, and environmental metrics from the dashboard cards.",
	},
];

const dashboardCards = [
	{
		title: "Device Cards",
		description: "Each card shows live state, quick control, and latest key readings.",
	},
	{
		title: "Power/Energy Stats",
		description: "Monitor instant power and cumulative usage for consumption awareness.",
	},
	{
		title: "Status Indicators",
		description: "ON/OFF and Online/Offline badges help identify device availability immediately.",
	},
];

const deviceCategories = [
	{
		name: "Power-centric",
		info: "Devices mainly tracked by power draw and energy efficiency.",
	},
	{
		name: "Temperature-centric",
		info: "Devices focused on thermal behavior and environmental comfort.",
	},
	{
		name: "Hybrid devices",
		info: "Devices reporting both electrical and environmental metrics.",
	},
];

const alertLevels = [
	{ label: "High", description: "Critical condition needing immediate action.", tone: "high" },
	{ label: "Medium", description: "Important but non-critical behavior change.", tone: "medium" },
	{ label: "Low", description: "Informational event for awareness and logging.", tone: "low" },
];

const metrics = [
	{
		title: "Power (W)",
		details: "Instant electricity usage at this moment. Useful for detecting active load spikes.",
	},
	{
		title: "Energy (kWh)",
		details: "Total electricity consumed over time. Useful for bill impact and trend analysis.",
	},
	{
		title: "Temperature",
		details: "Helps identify comfort, overheating, and appliance thermal anomalies.",
	},
	{
		title: "Humidity",
		details: "Supports indoor air comfort and can indicate moisture-related risks.",
	},
];

const troubleshootingItems = [
	{
		issue: "Device not connecting",
		fix: "Confirm network credentials, keep device near router, then restart device and router.",
	},
	{
		issue: "Incorrect readings",
		fix: "Check sensor calibration and placement, then refresh device data and compare after 2 cycles.",
	},
	{
		issue: "Offline status persists",
		fix: "Verify power source and WiFi signal strength; remove and re-add device if needed.",
	},
	{
		issue: "Alerts not triggering",
		fix: "Check threshold values, notification preferences, and whether rules are currently active.",
	},
];

const faqItems = [
	{
		q: "Can I add multiple devices?",
		a: "Yes. You can register and manage multiple devices across different rooms and categories.",
	},
	{
		q: "Does the app work offline?",
		a: "Live monitoring needs connectivity. Previously synced values may still be visible temporarily.",
	},
	{
		q: "How accurate are readings?",
		a: "Readings depend on sensor quality and calibration. Regular validation improves reliability.",
	},
];

const UserManual = () => {
	const [search, setSearch] = useState("");
	const [openTrouble, setOpenTrouble] = useState(0);
	const [openFaq, setOpenFaq] = useState(0);

	const sectionSearchCorpus = useMemo(
		() => [
			{
				id: "intro",
				text: "intro overview app purpose energy monitoring automation alerts",
			},
			{
				id: "getting-started",
				text: "sign up login add device connect wifi network start monitoring",
			},
			{
				id: "dashboard",
				text: "dashboard cards power energy status on off online offline metrics",
			},
			{
				id: "devices",
				text: "add edit control on off category power temperature hybrid",
			},
			{
				id: "alerts",
				text: "alerts notifications severity high medium low active resolved filter clear",
			},
			{
				id: "settings",
				text: "profile notification preferences theme ui system configuration",
			},
			{
				id: "metrics",
				text: "power energy temperature humidity meaning explanation",
			},
			{
				id: "troubleshooting",
				text: "device not connecting incorrect readings offline alerts not triggering",
			},
			{
				id: "faq",
				text: "multiple devices offline accuracy questions answers",
			},
			{
				id: "support",
				text: "contact support email report issue help",
			},
		],
		[]
	);

	const filteredIds = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return quickNav.map((section) => section.id);

		return sectionSearchCorpus
			.filter((item) => item.text.includes(q))
			.map((item) => item.id);
	}, [search, sectionSearchCorpus]);

	const showSection = (id) => filteredIds.includes(id);

	const scrollToSection = (id) => {
		const node = document.getElementById(id);
		if (node) {
			node.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	};

	return (
		<div className="manual-page">
			<header className="manual-header">
				<div>
					<p className="manual-kicker">Smart Home IoT Monitoring System</p>
					<h1>User Manual Hub</h1>
					<p className="manual-subtitle">
						Guided onboarding for first-time users plus a fast reference center for daily operation,
						troubleshooting, and support.
					</p>
				</div>

				<div className="manual-search">
					<Search size={18} />
					<input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search manual sections"
						aria-label="Search manual sections"
					/>
				</div>
			</header>

			<section className="manual-quick-nav" aria-label="Quick navigation">
				{quickNav.map((item) => {
					const Icon = item.icon;
					const disabled = !showSection(item.id);

					return (
						<button
							key={item.id}
							type="button"
							onClick={() => scrollToSection(item.id)}
							className="manual-nav-card"
							disabled={disabled}
						>
							<Icon size={17} />
							<span>{item.title}</span>
						</button>
					);
				})}
			</section>

			{showSection("intro") && (
				<section id="intro" className="manual-section">
					<h2>
						<BookOpen size={18} /> 1. Intro Section
					</h2>
					<p>
						The platform centralizes energy monitoring, device control, automation, and alerting in one
						interface. It helps users reduce waste, react to anomalies quickly, and manage smart home
						operations with less friction.
					</p>
					<div className="manual-preview-box" role="img" aria-label="Dashboard preview illustration">
						<LayoutDashboard size={22} />
						<div>
							<strong>Dashboard Preview</strong>
							<span>Live cards, energy metrics, and alert insights in a single glance.</span>
						</div>
					</div>
				</section>
			)}

			{showSection("getting-started") && (
				<section id="getting-started" className="manual-section">
					<h2>
						<Zap size={18} /> 2. Getting Started
					</h2>
					<div className="manual-steps-grid">
						{gettingStartedSteps.map((step, index) => (
							<article key={step.title} className="manual-step-card">
								<span className="step-number">{index + 1}</span>
								<h3>{step.title}</h3>
								<p>{step.details}</p>
							</article>
						))}
					</div>
				</section>
			)}

			{showSection("dashboard") && (
				<section id="dashboard" className="manual-section">
					<h2>
						<LayoutDashboard size={18} /> 3. Dashboard Overview
					</h2>
					<div className="manual-card-grid">
						{dashboardCards.map((card) => (
							<article key={card.title} className="manual-info-card">
								<h3>{card.title}</h3>
								<p>{card.description}</p>
							</article>
						))}
					</div>
					<p className="manual-note">
						Metrics meaning: <strong>Power</strong> = current usage in W, <strong>Energy</strong> =
						accumulated usage in kWh, and environmental metrics (temperature/humidity) reflect room
						comfort and sensor conditions.
					</p>
				</section>
			)}

			{showSection("devices") && (
				<section id="devices" className="manual-section">
					<h2>
						<Smartphone size={18} /> 4. Devices Page Guide
					</h2>
					<ul className="manual-list">
						<li>Add new devices from the device form and assign room/type metadata.</li>
						<li>Edit device details to keep names, limits, and categories accurate.</li>
						<li>Toggle ON/OFF directly from cards for immediate control actions.</li>
						<li>Open device-specific data views for focused monitoring and trends.</li>
					</ul>

					<div className="manual-pill-row">
						{deviceCategories.map((cat) => (
							<article key={cat.name} className="manual-pill-card">
								<h3>{cat.name}</h3>
								<p>{cat.info}</p>
							</article>
						))}
					</div>
				</section>
			)}

			{showSection("alerts") && (
				<section id="alerts" className="manual-section">
					<h2>
						<Bell size={18} /> 5. Alerts And Notifications
					</h2>
					<p>
						Alerts are triggered when thresholds, abnormal patterns, or defined safety conditions are
						met. Users can review <strong>Active</strong> alerts for open issues and <strong>Resolved</strong>{" "}
						alerts for historical records.
					</p>

					<div className="manual-alert-levels">
						{alertLevels.map((level) => (
							<div key={level.label} className={`alert-chip ${level.tone}`}>
								<strong>{level.label}</strong>
								<span>{level.description}</span>
							</div>
						))}
					</div>

					<p className="manual-note">
						Actions available: filter by severity/type/date, clear handled alerts, and manage notification
						channels.
					</p>
				</section>
			)}

			{showSection("settings") && (
				<section id="settings" className="manual-section">
					<h2>
						<Settings size={18} /> 6. Settings Page Guide
					</h2>
					<div className="manual-card-grid compact">
						<article className="manual-info-card">
							<User size={16} />
							<h3>Profile Settings</h3>
							<p>Update account identity, display profile, and personal information.</p>
						</article>
						<article className="manual-info-card">
							<Bell size={16} />
							<h3>Notification Preferences</h3>
							<p>Select how and when you receive critical and informational alerts.</p>
						</article>
						<article className="manual-info-card">
							<LayoutDashboard size={16} />
							<h3>Theme/UI Preferences</h3>
							<p>Adjust interface appearance and readability options for daily use.</p>
						</article>
						<article className="manual-info-card">
							<Settings size={16} />
							<h3>System Configurations</h3>
							<p>Maintain global behavior and monitoring defaults across the platform.</p>
						</article>
					</div>
				</section>
			)}

			{showSection("metrics") && (
				<section id="metrics" className="manual-section">
					<h2>
						<LineChart size={18} /> 7. Metrics Explanation
					</h2>
					<div className="manual-card-grid compact">
						{metrics.map((metric) => (
							<article key={metric.title} className="manual-info-card">
								<h3>{metric.title}</h3>
								<p>{metric.details}</p>
							</article>
						))}
					</div>
				</section>
			)}

			{showSection("troubleshooting") && (
				<section id="troubleshooting" className="manual-section">
					<h2>
						<Wrench size={18} /> 8. Troubleshooting
					</h2>
					<div className="manual-accordion">
						{troubleshootingItems.map((item, index) => {
							const isOpen = index === openTrouble;
							return (
								<button
									key={item.issue}
									type="button"
									className={`manual-accordion-item ${isOpen ? "open" : ""}`}
									onClick={() => setOpenTrouble(isOpen ? -1 : index)}
								>
									<div className="manual-accordion-head">
										<span>{item.issue}</span>
										<ChevronDown size={17} />
									</div>
									{isOpen && <p>{item.fix}</p>}
								</button>
							);
						})}
					</div>
				</section>
			)}

			{showSection("faq") && (
				<section id="faq" className="manual-section">
					<h2>
						<LifeBuoy size={18} /> 9. FAQ
					</h2>
					<div className="manual-accordion">
						{faqItems.map((item, index) => {
							const isOpen = index === openFaq;
							return (
								<button
									key={item.q}
									type="button"
									className={`manual-accordion-item ${isOpen ? "open" : ""}`}
									onClick={() => setOpenFaq(isOpen ? -1 : index)}
								>
									<div className="manual-accordion-head">
										<span>{item.q}</span>
										<ChevronDown size={17} />
									</div>
									{isOpen && <p>{item.a}</p>}
								</button>
							);
						})}
					</div>
				</section>
			)}

			{showSection("support") && (
				<section id="support" className="manual-section manual-support">
					<h2>
						<Mail size={18} /> 10. Contact And Support
					</h2>
					<p>Need help? Contact support for technical guidance and issue resolution.</p>
					<div className="manual-support-actions">
						<a href="mailto:support@smarthomeiot.local" className="support-btn primary">
							<Mail size={15} /> Email Support
						</a>
						<button type="button" className="support-btn ghost">
							<AlertTriangle size={15} /> Report An Issue
						</button>
					</div>
					<div className="manual-support-status">
						<span>
							<CheckCircle2 size={14} /> Help center online
						</span>
						<span>
							<Wifi size={14} /> Live monitoring available
						</span>
						<span>
							<XCircle size={14} /> Offline mode is limited
						</span>
					</div>
				</section>
			)}
		</div>
	);
};

export default UserManual;
