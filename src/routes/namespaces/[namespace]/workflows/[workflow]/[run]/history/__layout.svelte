<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';
  import {
    EventView,
    routeForEventHistoryItem,
  } from '$lib/utilities/route-for';

  import { fetchEvents } from '$lib/services/events-service';

  export const load: Load = async function ({ params, stuff }) {
    const { workflow } = stuff;
    const { namespace } = params;
    const parameters = {
      namespace,
      executionId: workflow.id,
      runId: workflow.runId,
    };

    const { events, eventGroups } = await fetchEvents(parameters);

    return {
      props: {
        namespace,
        workflow,
        events,
        eventGroups,
      },
      stuff: {
        events,
        eventGroups,
      },
    };
  };
</script>

<script lang="ts">
  import {
    faCode,
    faLayerGroup,
    faStream,
  } from '@fortawesome/free-solid-svg-icons';

  import { routeForEventHistory } from '$lib/utilities/route-for';
  import { getWorkflowStartedAndCompletedEvents } from '$lib/utilities/get-started-and-completed-events';

  import ExportHistory from '$lib/components/export-history.svelte';
  import ToggleButton from '$lib/components/toggle-button.svelte';
  import ToggleButtons from '$lib/components/toggle-buttons.svelte';
  import CodeBlock from '$lib/components/code-block.svelte';
  import PendingActivties from './_pending-activties.svelte';
  import { page } from '$app/stores';

  export let namespace: string;
  export let workflow: WorkflowExecution;
  export let events: HistoryEventWithId[];

  const { input, result } = getWorkflowStartedAndCompletedEvents(events);
  const routeParameters = (view: EventView, eventId?: string) => ({
    namespace,
    workflow: workflow.id,
    run: workflow.runId,
    view,
    eventId,
  });
</script>

<section class="flex flex-col gap-4">
  <div class="flex gap-4">
    <CodeBlock heading="Input" content={input} framed />
    <CodeBlock heading="Result" content={result} framed />
  </div>
  <PendingActivties />
  <section id="event-history">
    <nav class="flex gap-4 justify-between items-end pb-4">
      <h3 class="text-lg font-medium">Event History</h3>
      <div class="flex gap-4">
        <ToggleButtons>
          <ToggleButton
            icon={faStream}
            base={routeForEventHistory(routeParameters('summary'))}
            href={routeForEventHistoryItem(
              routeParameters('summary', $page.params.eventId || '1'),
            )}>Summary</ToggleButton
          >
          <ToggleButton
            icon={faLayerGroup}
            href={routeForEventHistory(routeParameters('compact'))}
            >Compact</ToggleButton
          >
          <ToggleButton
            icon={faCode}
            href={routeForEventHistory(routeParameters('json'))}
            >JSON</ToggleButton
          >
        </ToggleButtons>
        <ExportHistory />
      </div>
    </nav>
    <slot />
  </section>
</section>
