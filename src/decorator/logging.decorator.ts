export function TimeExecutionLogging(message?: string) {
  return function (target: object, name: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    descriptor.value = async function () {
      const start_time = Date.now();
      const result = await method.apply(this);
      console.log(
        `🚀 ~${message ? ' ' + message + ' |' : ''} ${target.constructor.name}.${name} | START AT: ${new Date(start_time).toString()} | EXECUTE IN: ${Date.now() - start_time} ms:`,
      );

      return result;
    };
  };
}
