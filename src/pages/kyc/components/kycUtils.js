/**
 * Compute a rollup status for a KYC section from its individual document statuses.
 * Returns 'Approved' only if all entries are Approved/Verified.
 * Returns 'Rejected' if any entry is Rejected.
 * Otherwise returns 'Pending'.
 */
export const sectionOverallStatus = (statuses) => {
  const vals = (statuses ?? []).filter(Boolean);
  if (!vals.length) return "Pending";
  // If every status is "Not Submitted", the section is Not Submitted
  if (vals.every((s) => s === "Not Submitted")) return "Not Submitted";
  if (vals.every((s) => s === "Approved" || s === "Verified"))
    return "Approved";
  if (vals.some((s) => s === "Rejected")) return "Rejected";
  return "Pending";
};

/**
 * Derive the physical address verification status from merchant data.
 * Physical address is OPTIONAL during onboarding.
 * Returns "Not Submitted" when the user never provided a physical address.
 */
export const getPhysicalAddressStatus = (data) => {
  if (!data?.addresses?.physical?.hasPhysicalAddress) {
    return "Not Submitted";
  }
  return (
    data.addresses.physical.verificationStatus ??
    data.kycStatus?.physicalAddress?.status ??
    "Pending"
  );
};

/**
 * Determine whether admin can review (approve/reject) a physical address.
 * Requires: address submitted, proof document exists, and status is still Pending.
 */
export const canReviewPhysicalAddress = (data) => {
  if (!data?.addresses?.physical?.hasPhysicalAddress) return false;
  const phys = data.addresses.physical;
  const hasProof = phys.addressProof?.length > 0 || !!phys.documentUrl;
  const status =
    phys.verificationStatus ??
    data.kycStatus?.physicalAddress?.status ??
    "Pending";
  return hasProof && status === "Pending";
};
