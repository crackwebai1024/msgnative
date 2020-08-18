export const dataPresentAndParamIdChanged = (thisProps, nextProps) => (
  thisProps.data && nextProps.data &&
  thisProps.params && nextProps.params &&
  thisProps.params.id && nextProps.params.id &&
  thisProps.params.id !== nextProps.params.id
)
