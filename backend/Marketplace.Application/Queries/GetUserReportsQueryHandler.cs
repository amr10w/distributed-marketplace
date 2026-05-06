using MarketPlace.Application.DTOs;
using MarketPlace.Domain.Entities;
using MarketPlace.Domain.Repositories;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace MarketPlace.Application.Queries
{
    public class GetUserReportsQueryHandler
    {
        private readonly IReportLogRepository _reportLogRepository;

        public GetUserReportsQueryHandler(IReportLogRepository reportLogRepository)
        {
            _reportLogRepository = reportLogRepository;
        }

        public async Task<JsonEnvelope> HandleAsync(JsonEnvelope request)
        {
            GetUserReportsPayload? payload;
            try
            {
                payload = JsonSerializer.Deserialize<GetUserReportsPayload>(request.Payload);
            }
            catch (JsonException)
            {
                return Fail(request.CorrelationId, "Invalid payload format.");
            }

            if (payload is null || payload.UserId <= 0)
            {
                return Fail(request.CorrelationId, "Invalid user ID");
            }

            var reports = await _reportLogRepository.GetByUserIdAsync(payload.UserId);

            if (!string.IsNullOrWhiteSpace(payload.ReportType))
            {
                var wanted = payload.ReportType.Trim().ToLowerInvariant();
                reports = reports.Where(r =>
                    (r.ReportType == ReportType.Checkout && wanted == "checkout") ||
                    (r.ReportType == ReportType.DepositCash && wanted == "deposit_cash"));
            }

            var projected = reports.Select(r => new
            {
                r.ReportId,
                r.GeneratedBy,
                ReportType = r.ReportType == ReportType.Checkout ? "checkout" : "deposit_cash",
                r.Parameters,
                r.ResultSnapshot,
                r.GeneratedAt
            }).ToList();

            return new JsonEnvelope
            {
                CorrelationId = request.CorrelationId,
                Command = "GET_USER_REPORTS_SUCCESS",
                Payload = JsonSerializer.Serialize(new { Reports = projected })
            };
        }

        private static JsonEnvelope Fail(string correlationId, string message)
            => new JsonEnvelope
            {
                CorrelationId = correlationId,
                Command = "GET_USER_REPORTS_FAILED",
                Payload = JsonSerializer.Serialize(new { Message = message })
            };
    }

    public record GetUserReportsPayload(int UserId, string? ReportType);
}
