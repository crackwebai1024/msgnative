export function * upgradePlanSuccess ({ data, requestPayload }) {
  // ax.form.success(ax.EVENTS.USER_PLAN, { 'Plan name': data.plan_name, Plan: requestPayload.plan_id, Coupon: requestPayload.coupon, Frequency: 'Annually', 'Payment Method': 'Credit Card' })
}

export function * upgradePlanError ({ e }) {
  // ax.form.error(ax.EVENTS.USER_PLAN, e.message, e.code)
}
