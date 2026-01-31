export type ReadLineTask = {
   section: string;
   properties: Map<string, string>;
};

function readLine(line: string, task: ReadLineTask): ReadLineTask {
   const trimmed = line.trim();
   if (!trimmed) {
      return task;
   }

   const section = /^\[([^=]+)]$/.exec(trimmed);
   const property = !section && /^([^#=]+)(={0,1})(.*)$/.exec(trimmed);

   if (section) {
      task.section = section[1];
   } else if (property) {
      const currentSection = task.section ? `${task.section}.` : '';
      task.properties.set(currentSection + property[1].trim(), property[3].trim());
   }

   return task;
}

export function read(input: string, task: ReadLineTask): ReadLineTask {
   return String(input)
      .split('\n')
      .reduce<ReadLineTask>(
         (task, line) => {
            return readLine(line, task);
         },
         { ...task, section: '' }
      );
}
