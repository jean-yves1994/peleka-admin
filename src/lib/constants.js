export const SHIPMENT_STATUS_COLORS = {
  draft:                     { bg:'bg-slate-100 dark:bg-slate-800',        text:'text-slate-700 dark:text-slate-300',  dot:'bg-slate-400' },
  pending_payment:           { bg:'bg-amber-50 dark:bg-amber-900/30',      text:'text-amber-700 dark:text-amber-300',  dot:'bg-amber-500' },
  awaiting_assignment:       { bg:'bg-indigo-50 dark:bg-indigo-900/30',    text:'text-indigo-700 dark:text-indigo-300',dot:'bg-indigo-500' },
  assigned:                  { bg:'bg-blue-50 dark:bg-blue-900/30',        text:'text-blue-700 dark:text-blue-300',    dot:'bg-blue-500' },
  rider_en_route_to_pickup:  { bg:'bg-sky-50 dark:bg-sky-900/30',          text:'text-sky-700 dark:text-sky-300',      dot:'bg-sky-500' },
  picked_up:                 { bg:'bg-cyan-50 dark:bg-cyan-900/30',        text:'text-cyan-700 dark:text-cyan-300',    dot:'bg-cyan-500' },
  in_transit:                { bg:'bg-teal-50 dark:bg-teal-900/30',        text:'text-teal-700 dark:text-teal-300',    dot:'bg-teal-500' },
  out_for_delivery:          { bg:'bg-emerald-50 dark:bg-emerald-900/30',  text:'text-emerald-700 dark:text-emerald-300',dot:'bg-emerald-500' },
  delivered:                 { bg:'bg-green-50 dark:bg-green-900/30',      text:'text-green-700 dark:text-green-300',  dot:'bg-green-500' },
  failed_pickup:             { bg:'bg-rose-50 dark:bg-rose-900/30',        text:'text-rose-700 dark:text-rose-300',    dot:'bg-rose-500' },
  failed_delivery:           { bg:'bg-rose-50 dark:bg-rose-900/30',        text:'text-rose-700 dark:text-rose-300',    dot:'bg-rose-500' },
  returned:                  { bg:'bg-orange-50 dark:bg-orange-900/30',    text:'text-orange-700 dark:text-orange-300',dot:'bg-orange-500' },
  cancelled:                 { bg:'bg-slate-100 dark:bg-slate-800',        text:'text-slate-600 dark:text-slate-400',  dot:'bg-slate-500' },
};
export const RIDER_STATUS_COLORS = {
  pending_approval: { bg:'bg-amber-50 dark:bg-amber-900/30',      text:'text-amber-700 dark:text-amber-300' },
  approved:         { bg:'bg-blue-50 dark:bg-blue-900/30',        text:'text-blue-700 dark:text-blue-300' },
  online:           { bg:'bg-emerald-50 dark:bg-emerald-900/30',  text:'text-emerald-700 dark:text-emerald-300' },
  busy:             { bg:'bg-violet-50 dark:bg-violet-900/30',    text:'text-violet-700 dark:text-violet-300' },
  offline:          { bg:'bg-slate-100 dark:bg-slate-800',        text:'text-slate-700 dark:text-slate-300' },
  suspended:        { bg:'bg-rose-50 dark:bg-rose-900/30',        text:'text-rose-700 dark:text-rose-300' },
};
