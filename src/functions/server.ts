export function LogCalls(
  target: Object,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const method = descriptor.value;
  descriptor.value = async function (req: any, res: any) {
    console.log(`[INFO] Function ${method.name} was called.`)
    await method.apply(this, arguments);
  };

  return descriptor;
}
