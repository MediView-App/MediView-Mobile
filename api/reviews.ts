import { api } from "@/lib/api";
import { DEMO_MODE } from "@/lib/config";

export type DoctorReviewItem = {
  id: number;
  rating: number;
  comment?: string;
  patientName?: string;
  createdAt?: string;
};

export type DoctorReviewSummary = {
  average: number;
  count: number;
  reviews: DoctorReviewItem[];
};

/** 완료된 진료에 리뷰를 남긴다. */
export async function submitReview(
  appointmentId: string | number,
  rating: number,
  comment: string,
): Promise<void> {
  if (DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 600));
    return;
  }
  await api<void>("/api/reviews", {
    method: "POST",
    body: { appointmentId: Number(appointmentId), rating, comment: comment || undefined },
  });
}

/** 의료진 평점·리뷰 요약. */
export async function getDoctorReviews(doctorUserId: string | number): Promise<DoctorReviewSummary> {
  if (DEMO_MODE) {
    return {
      average: 4.8,
      count: 126,
      reviews: [
        { id: 1, rating: 5, comment: "친절하게 설명해 주셨어요.", patientName: "김*수", createdAt: "" },
        { id: 2, rating: 5, comment: "대기 없이 빠르게 진료봤습니다.", patientName: "이*은", createdAt: "" },
        { id: 3, rating: 4, comment: "처방이 잘 들었어요.", patientName: "박*호", createdAt: "" },
      ],
    };
  }
  return api<DoctorReviewSummary>(`/api/reviews/doctor/${doctorUserId}`);
}
