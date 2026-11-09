export const ROMAN = [
	"",
	"I",
	"II",
	"III",
	"IV",
	"V",
	"VI",
	"VII",
	"VIII",
	"IX",
];

export const fmtBr = (n) => n.toFixed(1);

export const fmtKg = (kg) =>
	kg >= 1000 ? `${Number((kg / 1000).toFixed(2))} t` : `${kg} kg`;

/** Lowercase, alphanumerics only: used for forgiving name matching. */
export const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** CSS class for a plane's name colour (premium / squadron vehicles). */
export const nameClass = (plane) =>
	plane.premium ? "premium" : plane.squadron ? "squadron" : "";
