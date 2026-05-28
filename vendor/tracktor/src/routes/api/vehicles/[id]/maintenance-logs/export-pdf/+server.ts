import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import * as maintenanceLogService from '$server/services/maintenanceLogService';
import * as vehicleService from '$server/services/vehicleService';
import { generateMaintenanceLogsPdf } from '$server/services/maintenanceLogPdfService';
import { withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (event) => {
  return withRouteErrorHandling('Maintenance logs PDF export error:', async () => {
    const { id: vehicleId } = event.params;

    if (!vehicleId) {
      throw error(400, 'Vehicle ID is required');
    }

    const vehicleResult = await vehicleService.getVehicleById(vehicleId);
    if (!vehicleResult.data) {
      throw error(404, 'Vehicle not found');
    }
    const vehicle = vehicleResult.data;

    const logsResult = await maintenanceLogService.getMaintenanceLogs(vehicleId);
    const maintenanceLogs = logsResult.data || [];

    const pdfBuffer: any = await generateMaintenanceLogsPdf(maintenanceLogs, {
      licensePlate: vehicle.licensePlate,
      name: vehicle.name
    });

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="maintenance-log-${vehicle.licensePlate}.pdf"`
      }
    });
  });
};
